import { useState } from 'react';
import { View, Button, Text } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'


const uploadUrl = `/myAlfred/api/studio/action`

function createFileFromBlob(folder: string, filename: string, fileData: Blob) {
  const { fileInFolder } = S3UrlRessource({
    filename,
    folder,
  })
  return new File([fileData], fileInFolder, {
    type: mime.getType(getExtension(filename)) || '',
  })
}

const uploadFileToS3 = async (file: File) => {
  return await FileManager.createFile(file.name, file, '', file.type, [])
}

const uploadMultipleToS3 = async (folder: string, unzip: any) => {
  for await (const filename of Object.keys(unzip.files)) {
    const blob = await unzip.files[filename].async('blob')
    if (!unzip.files[filename]?.dir) {
      const file = createFileFromBlob(folder, filename, blob)
      await uploadFileToS3(file)
    }
  }
}

const isScormZip = async (unzipped: any) => {
  let scormVersion = null
  // looking for scorm version in imsmanifest.xml
  for (const filename of Object.keys(unzipped.files)) {
    if (!unzipped.files[filename]?.dir) {
      if (filename === 'imsmanifest.xml') {
        const text = await unzipped.files[filename].async('string')
        const imsmanifest = xmljs.xml2js(text, { compact: true })
        //@ts-ignore
        scormVersion = imsmanifest?.manifest?._attributes?.version
      }
    }
  }
  return scormVersion
}

const UploadFile = ({
  dataSource,
  attribute,
  value,
  backend,
  children,
  reload,
  ...props
}: {
  dataSource: { _id: null } | null
  attribute: string
  value: string
  backend: string
  reload: any
  children: React.ReactNode
}) => {
 
    const [result, setResult] = useState()

  // const handleError = (err: unknown) => {
  //   if (DocumentPicker.isCancel(err)) {
  //     console.warn('cancelled')
  //     // User cancelled the picker, exit any dialogs or menus and move on
  //   } else if (isInProgress(err)) {
  //     console.warn('multiple pickers were opened, only the last will be considered')
  //   } else {
  //     throw err
  //   }
  // }

  const _pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    alert(result.uri);
    console.log(result);
  }

  return (
    <View {...props}>
      <Button
        title={'Upload'} 
        onPress={_pickDocument} />
      {/* Whatever in children, it bring focus on InputFile */}
      {children}  
    </View>
  )
}


export default UploadFile
