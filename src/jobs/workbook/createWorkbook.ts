import { FlatfileListener } from '@flatfile/listener'
import api from '@flatfile/api'
import { jobHandler } from '../../plugins/job.handler'

export default function createWorkbook(listener: FlatfileListener) {
  listener.use(
    jobHandler('workbook:createWorkbook', async (event) => {
      const { spaceId, environmentId, workbookId } = event.context
      console.log('Event context:', event.context) // log the event context

      try {
        // Get the data from the csEntrySheet in the workbook where the job was initiated from
        const workbook = await api.workbooks.get(workbookId)
        console.log('Workbook:', workbook) // log the workbook

        // Find the csEntrySheet in the workbook
        const csEntrySheet = workbook.data.sheets.find(
          (sheet) => sheet.name === '📝 CS Entry Sheet'
        )
        console.log('CS Entry Sheet:', csEntrySheet) // log the CS Entry Sheet object

        // Fetch the records for the CS Entry Sheet
        const csEntryRecords = await api.records.get(csEntrySheet.id)
        console.log('CS Entry Records:', csEntryRecords) // log the CS Entry Records

        // Create a new SheetConfig
        const newSheetConfig = {
          name: '🎫 Customer Entry Sheet',
          slug: 'customerEntrySheet',
          fields: [],
        }

        // Iterate over the records and create fields
        for (const record of csEntryRecords.data.records) {
          const key = record.values['key']?.value || ''
          const label = record.values['label']?.value || key

          const field = {
            key: key,
            label: label,
            type: record.values['type']?.value || 'string', // Set a default type if not provided
            description: record.values['description']?.value || '',
            readonly: Boolean(record.values['readOnly']?.value),
            metadata: {}, // Initialize an empty metadata object
            constraints: [],
          }

          // Populate constraints if required or unique is true in the record
          if (record.values['required']?.value) {
            field.constraints.push({
              type: 'required',
            })
          }
          if (record.values['unique']?.value) {
            field.constraints.push({
              type: 'unique',
            })
          }

          newSheetConfig.fields.push(field)
        }

        console.log('New SheetConfig:', newSheetConfig)

        // Create a new workbook with specific parameters
        const createWorkbook = await api.workbooks.create({
          spaceId,
          environmentId,
          name: 'Data Entry Workbook',
          sheets: [newSheetConfig],
          actions: [
            {
              operation: 'submitAction',
              mode: 'foreground',
              label: 'Submit Data to BigQuery',
              type: 'string',
              description: 'Submit Data',
              primary: true,
            },
          ],
        })

        console.log('Created Workbook:', createWorkbook)

        // Prepare sheets for update
        const updatedSheets = workbook.data.sheets.map((sheet) => {
          return {
            name: sheet.name,
            slug: sheet.config.slug,
            readonly: true, // set readonly to true for all sheets
            fields: sheet.config.fields,
          }
        })

        console.log('Sheets for update:', updatedSheets) // log the updated sheets for update

        const updateWorkbook = await api.workbooks.update(workbookId, {
          spaceId,
          environmentId,
          name: workbook.data.name,
          sheets: updatedSheets,
          actions: [],
        })

        console.log('Updated Workbook:', updateWorkbook)

        // Return JobOutcome object
        return {
          outcome: {
            message:
              'A new workbook has been successfully created based on the data entered in the CS Entry Sheet. The CS Entry Sheet is now locked.',
          },
          info: 'The workbook has been updated and a new one has been created based on the CS Entry Sheet.',
        } as const
      } catch (error) {
        console.error(error)
        throw error // Rethrow the error to be caught by the jobHandler's error handling logic
      }
    })
  )
}
