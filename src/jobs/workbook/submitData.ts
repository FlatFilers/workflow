import { FlatfileListener } from '@flatfile/listener'
import api from '@flatfile/api'
import { jobHandler } from '../../plugins/job.handler'
import { FlatfileEvent } from '@flatfile/listener'
import axios from 'axios'

export default function submitData(listener: FlatfileListener) {
  listener.filter({ job: 'workbook:submitAction' }, (configure) => {
    configure.on('job:ready', async (event) => {
      const { jobId, workbookId } = event.context
      let customerCredentials, bqKey, bqSecret

      try {
        // This assumes a secret is set on the Space with the label "BQAccountId"
        customerCredentials = await event.secrets('BQAccountId')
        // This assumes secrets are set on the Environment with the labels BitQuery_API_KEY and BitQuery_API_SECRET
        bqKey = await event.secrets('BQ_API_KEY')
        bqSecret = await event.secrets('BQ_API_SECRET')
      } catch (error) {
        console.log(`[credentials error]: ${JSON.stringify(error, null, 2)}`)

        await api.jobs.fail(jobId, {
          outcome: {
            message:
              'Unable to find BitQuery API and customer credentials for a direct submission. This data will remain securely stored until credentials have been added.',
          },
        })
        return
      }

      const sheets = await api.sheets.list({ workbookId })

      const records = {} as any
      for (const [index, element] of sheets.data.entries()) {
        records[`Sheet[${index}]`] = await api.records.get(element.id)
      }

      try {
        await api.jobs.ack(jobId, {
          info: 'Starting job to submit data',
          progress: 10,
        })

        // BitQuery-specific API stuff goes here
        const webhookReceiver =
          process.env.WEBHOOK_SITE_URL ||
          'https://webhook.site/c83648d4-bf0c-4bb1-acb7-9c170dad4388'

        const response = await axios.post(
          webhookReceiver,
          {
            ...event.payload,
            method: 'axios',
            sheets,
            records,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        // Check if this is the response code that you would expect, otherwise BitQuery-specific API stuff ends here
        if (response.status === 200) {
          await api.jobs.complete(jobId, {
            outcome: {
              message: 'Data was successfully submitted. Go check it out!',
            },
          })
        } else {
          throw new Error('Failed to submit data')
        }
      } catch (error) {
        console.log(`[submit error]: ${JSON.stringify(error, null, 2)}`)

        await api.jobs.fail(jobId, {
          outcome: {
            message: 'This job failed.',
          },
        })
      }
    })
  })
}
