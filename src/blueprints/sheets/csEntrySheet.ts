import { Flatfile } from '@flatfile/api'

export const csEntrySheet: Flatfile.SheetConfig = {
  name: '📝 CS Entry Sheet',
  slug: 'csEntrySheet',
  fields: [
    {
      key: 'key',
      label: 'Key',
      type: 'string',
      constraints: [
        {
          type: 'required',
        },
        {
          type: 'unique',
        },
      ],
    },
    {
      key: 'label',
      label: 'Label',
      type: 'string',
      constraints: [
        {
          type: 'required',
        },
        {
          type: 'unique',
        },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      type: 'enum',
      config: {
        options: [
          { value: 'string', label: 'String' },
          { value: 'date', label: 'Date' },
          { value: 'number', label: 'Number' },
          { value: 'boolean', label: 'Boolean' },
        ],
      },
      constraints: [
        {
          type: 'required',
        },
      ],
    },
    {
      key: 'description',
      label: 'Description',
      type: 'string',
    },
    {
      key: 'required',
      label: 'Required',
      type: 'boolean',
    },
    {
      key: 'unique',
      label: 'Unique',
      type: 'boolean',
    },
    {
      key: 'readOnly',
      label: 'Read Only',
      type: 'boolean',
    },
    {
      key: 'metadata',
      label: 'Metadata',
      type: 'string',
      description:
        'Useful for any contextual metadata regarding the schema. Store any valid json here.',
    },
  ],
}
