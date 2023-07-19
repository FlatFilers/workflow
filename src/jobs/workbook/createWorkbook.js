import { FlatfileListener } from '@flatfile/listener'
import api from '@flatfile/api'
import { jobHandler } from '../../plugins/job.handler'

export default function createWorkbook(listener) {
  listener.use(
    jobHandler('workbook:createWorkbook', async (event) => {
      const { spaceId, environmentId, workbookId } = event.context
      console.log('Event context:', event.context) // log the event context

      // 1. Get the data from the csEntrySheet in the workbook where the job was initiated from
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
        name: 'New Sheet based on CS Entry Sheet',
        slug: 'newSheetBasedOnCSEntrySheet',
        fields: [],
      }

      // Iterate over the records and create fields
      for (const record of csEntryRecords.data.records) {
        const field = {
          key: record.values['key']?.value || '',
          label: record.values['label']?.value || '',
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
        name: 'New Workbook',
        sheets: [newSheetConfig],
        actions: [
          {
            operation: 'submitAction',
            mode: 'foreground',
            label: 'Submit',
            type: 'string',
            description: 'Submit Data',
            primary: true,
          },
        ],
      })

      console.log('Created Workbook:', createWorkbook)
    })
  )
}
