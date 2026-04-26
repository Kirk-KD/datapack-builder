import type {
  EditorBaseProps,
  EditorState,
  ItemComponent,
  ItemStackEditorResult
} from "../../../../core/editor";
import {ItemSelectorEditor} from "../ItemSelectorEditor";
import {useEffect, useState} from "react";
import NumberEditor from "../NumberEditor.tsx";

import ItemComponentList from "./ItemComponentList.tsx";
import {Box, Stack, Typography} from "@mui/material";

export default function ItemStackEditor({context, state, setState}: EditorBaseProps<Record<string, unknown>, ItemStackEditorResult>) {
  const [itemState, setItemState] = useState<EditorState<string>>(state.data?.item ?? { compiler: 'item_stack', error: false })
  const [amountState, setAmountState] = useState<EditorState<number>>(state.data?.amount ?? { compiler: 'item_stack', error: false })
  const [itemComponents, setItemComponents] = useState<ItemComponent[]>(state.data?.components ?? [])

  const doCallback = (
    item: EditorState<string> = itemState,
    amount: EditorState<number> = amountState,
    components: ItemComponent[] = itemComponents
  ) => {
    if (item?.error || amount?.error || !item || !amount || components.some(({state}) => state?.error)) {
      setState({ ...state, error: true })
      return
    }

    setState({
      compiler: 'item_stack',
      error: false,
      data: {
        item: item,
        amount: amount,
        components: components
      }
    })
  }

  useEffect(() => {
    doCallback()
  }, [itemState, amountState, itemComponents]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack spacing={1}>
      <Stack spacing={1} direction={'row'} sx={{
        alignItems: 'center'
      }}>
        <ItemSelectorEditor context={context} state={itemState} setState={setItemState}/>
        <Typography>count:</Typography>
        <NumberEditor sx={{
          maxWidth: '8rem',
          minWidth: '2rem' // Override default
        }} defaultValue={1} type={'int'} min={1} state={amountState} setState={setAmountState} />
      </Stack>
      <Box sx={{
        pl: 1
      }}>
        <ItemComponentList itemComponents={itemComponents} setItemComponents={result => {
          setItemComponents(result)
        }}/>
      </Box>
    </Stack>
  )
}