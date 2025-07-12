import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button, Switch } from '@mui/material'
import Send from "@mui/icons-material/Send" 

function App() {
  const [dark, setDark] = useState(false);

  return (
    <div className={dark?"dark":""}>
      DarkMode
      <Switch
            checked={dark}
            onChange={() => setDark(!dark)}
            name="loading"
            color="primary"
          />
      <div className='text-2xl flex flex-col gap-5 dark:bg-neutral-500 dark:text-white items-center h-screen font-bold justify-center'>
       <img src='./src/assets/Images/profile.jpg' className='size-10 rounded-full'></img>   
       React App
       <Button  variant={dark?'outlined':'contained'} color={dark?"inherit":"primary"}  endIcon={<Send></Send>}>Click Me</Button>
    </div>
    </div>
  )
}

export default App