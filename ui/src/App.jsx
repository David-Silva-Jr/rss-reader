import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button, Box } from '@mui/material'
import './App.css'

function App() {

  return (
    <Box sx={{ width: '100%', height: '100%', alignContent: 'end', backgroundColor: '#CCCCCC' }}>
      <Button sx={{ boxShadow: 1 }}>
        Button Label
      </Button>
    </Box>
  )
}

export default App
