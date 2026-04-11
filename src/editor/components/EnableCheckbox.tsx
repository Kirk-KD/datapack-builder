export default function EnableCheckbox({ show }: { show?: boolean }) {
  return <input type='checkbox' className='enableCheckbox' style={show ? {} : {visibility: 'hidden'}}/>
}