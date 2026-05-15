import {Stack, Typography} from '@mui/material'
import {useState} from 'react'
import TextInput from '../../editor/components/TextInput.tsx'
import DropdownInput from '../../editor/components/DropdownInput.tsx'

const DEFAULT_TYPED_VALUE_NAME = 'var'

type CreateTypedValueProps<TValueType extends string> = {
  defaultName?: string
  defaultType?: TValueType
  typeOptions: TValueType[]
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
  const initialType = defaultType ?? typeOptions[0]
  if (initialType === undefined) {
    throw new Error('CreateTypedValue requires at least one type option or a default type.')
  }

  const [valueName, setValueName] = useState(defaultName)
  const [valueType, setValueType] = useState<TValueType>(initialType)

  const handleNameChange = (name: string) => {
    setValueName(name)
    onChangeName(name)
  }

  const handleTypeChange = (type: TValueType) => {
    setValueType(type)
    onChangeType(type)
  }

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
          options={typeOptions}
          value={valueType}
          setValue={type => handleTypeChange(type as TValueType)}
          sx={{
            flex: 1,
          }}
        />
      </Stack>
    </Stack>
  )
}
