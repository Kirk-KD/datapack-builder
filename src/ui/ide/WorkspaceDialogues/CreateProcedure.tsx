import {IconButton, Stack, Typography} from '@mui/material'
import TextInput from '../../editor/components/TextInput.tsx'
import {useEffect, useRef, useState} from 'react'
import type {CreateParamData} from '../../../core/blockly'
import type {VariableValueType} from '../../../core/blockly/registry'
import DropdownInput from '../../editor/components/DropdownInput.tsx'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

const DEFAULT_PROC_NAME = 'my_procedure'
const DEFAULT_PARAM_PREFIX = 'arg'

type ParameterRowProps = {
  defaultName: string,
  name: string
  setName: (name: string) => void
  type: VariableValueType
  setType: (type: VariableValueType) => void
  onDelete: () => void
}
function ParameterRow({ defaultName, name, setName, type, setType, onDelete }: ParameterRowProps) {
  return (
    <Stack direction={'row'} spacing={1} sx={{
      alignItems: 'center'
    }}>
      <TextInput defaultValue={defaultName} value={name} setValue={setName} sx={{
        flex: 2
      }}/>
      <DropdownInput
        options={[
          'int'
        ] as VariableValueType[]}
        value={type}
        setValue={setType as (type: string) => void}
        sx={{
          flex: 1
        }}
      />
      <IconButton onClick={onDelete}>
        <DeleteIcon color={'primary'}/>
      </IconButton>
    </Stack>
  )
}

type ParameterRowState = {
  id: string
  defaultName: string
  name: string
  type: VariableValueType
}

function getNextDefaultParameterName(parameters: ParameterRowState[]) {
  const usedDefaultNames = new Set(parameters.map(parameter => parameter.defaultName))
  let nextIndex = 1

  while (usedDefaultNames.has(`${DEFAULT_PARAM_PREFIX}${nextIndex}`)) {
    nextIndex += 1
  }

  return `${DEFAULT_PARAM_PREFIX}${nextIndex}`
}

type CreateProcedureProps = {
  onChangeName: (name: string) => void
  onChangeParams: (params: CreateParamData[]) => void
}
export function CreateProcedure({ onChangeName, onChangeParams }: CreateProcedureProps) {
  const [procName, setProcName] = useState(DEFAULT_PROC_NAME)
  const [parameters, setParameters] = useState<ParameterRowState[]>([])
  const nextParameterIdRef = useRef(1)

  const handleNameChange = (name: string) => {
    setProcName(name)
    onChangeName(name)
  }

  useEffect(() => {
    onChangeParams(parameters.map(({ name, type }) => ({ name, type })))
  }, [parameters, onChangeParams])

  const handleAddParameter = () => {
    setParameters(prevParameters => {
      const defaultName = getNextDefaultParameterName(prevParameters)
      const id = `parameter-${nextParameterIdRef.current}`
      nextParameterIdRef.current += 1

      return [
        ...prevParameters,
        {
          id,
          defaultName,
          name: defaultName,
          type: 'int',
        },
      ]
    })
  }

  const handleDeleteParameter = (parameterId: string) => {
    setParameters(prevParameters =>
      prevParameters.filter(parameter => parameter.id !== parameterId))
  }

  return (
    <Stack spacing={1} sx={{
      width: '30rem',
      height: 'auto',
    }}>
      <Stack direction={'row'} spacing={1} sx={{
        width: '100%',
        alignItems: 'center'
      }}>
        <Typography>Name</Typography>
        <TextInput
          defaultValue={DEFAULT_PROC_NAME}
          value={procName}
          setValue={handleNameChange}
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: '100%'
          }}
        />
      </Stack>
      <Stack direction={'row'} spacing={1} sx={{
        alignItems: 'center'
      }}>
        <Typography>Parameters</Typography>
        <IconButton color={'primary'} onClick={handleAddParameter} aria-label={'Add parameter'}>
          <AddIcon/>
        </IconButton>
      </Stack>
      <Stack spacing={1} sx={{
        pl: 1,
        pr: 1,
        flex: 1,
      }}>
        {parameters.length === 0 ? (
          <Typography color={'textSecondary'}>
            No parameters yet. Use the plus button to add one.
          </Typography>
        ) : parameters.map(parameter => (
          <ParameterRow
            key={parameter.id}
            defaultName={parameter.defaultName}
            name={parameter.name}
            setName={name => {
              setParameters(prevParameters => prevParameters.map(prevParameter => (
                prevParameter.id === parameter.id
                  ? { ...prevParameter, name }
                  : prevParameter
              )))
            }}
            type={parameter.type}
            setType={type => {
              setParameters(prevParameters => prevParameters.map(prevParameter => (
                prevParameter.id === parameter.id
                  ? { ...prevParameter, type }
                  : prevParameter
              )))
            }}
            onDelete={() => handleDeleteParameter(parameter.id)}
          />
        ))}
      </Stack>
    </Stack>
  )
}