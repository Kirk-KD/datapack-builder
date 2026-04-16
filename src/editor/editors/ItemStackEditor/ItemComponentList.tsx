import './ItemComponentList.css'
import DropdownInput from "../../components/DropdownInput.tsx";
import {KeyValueEditor} from "../KeyValueEditor";
import NumberEditor from "../NumberEditor.tsx";
import ItemComponentContainer from "./ItemComponentContainer.tsx";
import type {ItemComponent} from "./types.ts";

type ItemComponentListProps = {
  callback: (components: ItemComponent[]) => void
}

export default function ItemComponentList({ callback }: ItemComponentListProps) {
  return (
    <div className={'itemComponentList'}>
      <div className={'top'}>
        <span>Add component:</span>
        <DropdownInput className={'itemComponentDropdown'} options={['A', 'B', 'C']} />
        <button>+</button>
        <button>+ !</button>
      </div>

      <div className={'componentEditorsContainer'}>
        <ItemComponentContainer name={'attack_range'} editor={
          <KeyValueEditor callback={() => {}} entries={[
            {
              key: 'min_reach',
              description: 'The minimum distance in blocks from the attacker to the target to be considered valid. Defaults to 0.0, valid from 0.0 to 64.0.',
              component: cb => <NumberEditor context={{}} callback={cb} type={'float'} defaultValue={0} min={0} max={64}/>
            }
          ]}/>
        }/>
        <ItemComponentContainer name={'attack_range'} editor={
          <KeyValueEditor callback={() => {}} entries={[
            {
              key: 'min_reach',
              description: 'The minimum distance in blocks from the attacker to the target to be considered valid. Defaults to 0.0, valid from 0.0 to 64.0.',
              component: cb => <NumberEditor context={{}} callback={cb} type={'float'} defaultValue={0} min={0} max={64}/>
            }
          ]}/>
        }/>
      </div>
    </div>
  )
}