import {Stack, Typography} from '@mui/material'
import {useState} from 'react'
import TextInput from '../../editor/components/TextInput.tsx'
import DropdownInput from '../../editor/components/DropdownInput.tsx'
import type {VariableValueType} from '../../../core/blockly/registry'

const DEFAULT_VARIABLE_NAME = 'var'

type CreateVariableProps = {
  onChangeName: (name: string) => void
  onChangeType: (type: VariableValueType) => void
}

export function CreateVariable({ onChangeName, onChangeType }: CreateVariableProps) {
  const [variableName, setVariableName] = useState(DEFAULT_VARIABLE_NAME)
  const [variableType, setVariableType] = useState<VariableValueType>('int')

  const handleNameChange = (name: string) => {
    setVariableName(name)
    onChangeName(name)
  }

  const handleTypeChange = (type: VariableValueType) => {
    setVariableType(type)
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
          defaultValue={DEFAULT_VARIABLE_NAME}
          value={variableName}
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
          options={['int'] as VariableValueType[]}
          value={variableType}
          setValue={type => handleTypeChange(type as VariableValueType)}
          sx={{
            flex: 1,
          }}
        />
      </Stack>
    </Stack>
  )
}