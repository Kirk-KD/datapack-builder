import {Stack, Typography} from '@mui/material'
import {useState} from 'react'
import TextInput from '../../editor/components/TextInput.tsx'
import DropdownInput from '../../editor/components/DropdownInput.tsx'

const DEFAULT_TYPED_VALUE_NAME = 'var'

type TypeOption<TValueType extends string> = {
  label: string
  value: TValueType
}

type CreateTypedValueProps<TValueType extends string> = {
  defaultName?: string
  defaultType?: TValueType
  typeOptions: TypeOption<TValueType>[]
  onChangeName: (name: string) => void
  onChangeType: (type: TValueType) => void
}

export function CreateTypedValue<TValueType extends string>({
  defaultName = DEFAULT_TYPED_VALUE_NAME,
  defaultType,
  typeOptions,
  onChangeName,
  onChangeType,
}: CreateTypedValueProps<TValueType>) {
  const initialOption = defaultType
    ? typeOptions.find(option => option.value === defaultType)
    : typeOptions[0]

  if (initialOption === undefined) {
    throw new Error('CreateTypedValue requires at least one type option or a default type.')
  }

  const [valueName, setValueName] = useState(defaultName)
  const [valueType, setValueType] = useState<TValueType>(initialOption.value)

  const handleNameChange = (name: string) => {
    setValueName(name)
    onChangeName(name)
  }

  const handleTypeChange = (label: string) => {
    const selectedOption = typeOptions.find(option => option.label === label)
    if (!selectedOption) return

    setValueType(selectedOption.value)
    onChangeType(selectedOption.value)
  }

  const selectedTypeLabel = typeOptions.find(option => option.value === valueType)?.label ?? initialOption.label

  return (
    <Stack spacing={1} sx={{
      width: '20rem',
      height: 'auto',
    }}>
      <Stack direction={'row'} spacing={1} sx={{
        width: '100%',
        alignItems: 'center'
      }}>
        <Typography sx={{ minWidth: '5rem' }}>Name</Typography>
        <TextInput
          defaultValue={defaultName}
          value={valueName}
          setValue={handleNameChange}
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: '100%'
          }}
        />
      </Stack>
      <Stack direction={'row'} spacing={1} sx={{
        width: '100%',
        alignItems: 'center'
      }}>
        <Typography sx={{ minWidth: '5rem' }}>Type</Typography>
        <DropdownInput
          options={typeOptions.map(option => option.label)}
          value={selectedTypeLabel}
          setValue={handleTypeChange}
          sx={{
            flex: 1,
          }}
        />
      </Stack>
    </Stack>
  )
}
