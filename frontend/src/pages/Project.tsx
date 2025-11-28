import { useParams } from 'react-router-dom'
import { AppCreator } from '../components'
import { useEffect } from 'react'

const Project = () => {
  const {projectId} = useParams()
  useEffect(()=>{
    
  },[projectId])
  return (
    <AppCreator/>
  )
}

export default Project