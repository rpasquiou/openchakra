import React, { useState, useEffect, useRef } from 'react';
import { Flex } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import('jodit-react'), {
  ssr: false,
});

const Lexical = ({
  isEditable = false, // read-only or writable
  name,
  value,
  attribute,
  onChange,
  id,
  ...rest
}) => {
  const [html, setHtml] = useState(value || '');
  const editorRef = useRef(null);

  useEffect(() => {
    if (value) {
      setHtml(value);
    }
  }, [value]);

  // Editor changed : convert to HTML & send call onChange if defined
  const handleChange = (newContent) => {
    console.log("************************************",newContent)
    setHtml(newContent);
    const event = { target: { value: newContent } };
    onChange(event);
  };

  const config = {
    readonly: !isEditable,
    placeholder: 'Tapez...',
  };

  const props = { id, attribute, value: html, ...rest };
  console.log(editorRef)
  return (
    <Flex {...props}>
      {isEditable 
        ? <JoditEditor
            ref={editorRef}
            value={html}
            config={config}
            onBlur={(newContent) => handleChange(newContent)}
            tabIndex={1}
          />
        : <div dangerouslySetInnerHTML={{ __html: value }} />
      }
    </Flex>
  );
};

export default Lexical;
