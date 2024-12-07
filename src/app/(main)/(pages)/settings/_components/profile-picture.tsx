import React from 'react'
import UploadcareButton from './uploadcare-button'

type Props = {}

function ProfilePicture({}: Props) {
  return (
    <div className="flex flex-col">
      <p className="text-lg text-white"> Profile Picture</p>
      <div className="flex h-[30vh] flex-col items-center justify-center">
        <UploadcareButton onUpload={function (e: string) {
                  throw new Error('Function not implemented.')
              } }/>
      </div>
      </div>
  )
}

export default ProfilePicture