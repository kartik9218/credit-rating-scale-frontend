import React, { useEffect, useState } from "react";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";

const COMPANY_UUID = "a5373a81-1a7a-472a-a9ce-cbf4a0f16e05";

function UploadTest() {
  const [mandates, setMandates] = useState([]);
  const [selectedMandates, setSelectedMandates] = useState([]);
  const [isUploadAllowed, setIsUploadAllowed] = useState(false);

  const fetchMandates = async () => {
    return new Promise(async (resolve, reject) => {
      HTTP_CLIENT(APIFY("/v1/companies/view_mandates"), {
        'company_uuid': COMPANY_UUID,
      }).then(async (result) => {
        resolve(result);
      });
    });
  }

  const handleMandateOptionChange = (ev) => {
    const {
      target: { value },
    } = ev;
    setSelectedMandates(value);
  }

  useEffect(() => {
    let allowUpload = (selectedMandates.length > 0);
    setIsUploadAllowed(allowUpload);
  }, [selectedMandates]);


  const onUploadDocument = async () => {
    var form = new FormData();
    selectedMandates.forEach(id => {
      form.append("mandate_id[]", id);
    });
    const documentFile = document.getElementById('document').files[0];
    form.append("document", documentFile);
    
    // Change this URL as Live Server had not deployed this API Endpoint
    const upload = await HTTP_CLIENT('http://localhost:3001/sync/multipart_test', form, true);
    console.log("Upload Response", upload);
  }

  const doUiTasks = async () => {
    const response = await fetchMandates();
    const { mandates } = response;
    setMandates(mandates);
  }

  useEffect(() => {
    doUiTasks();
  }, []);

  return (
    <div>
      <h1>Mandate Selection</h1>
      <hr />
      <br />

      <FormControl sx={{width: "300px"}}>
        <InputLabel>Select Mandates</InputLabel>
        <Select
          value={selectedMandates}
          label="Mandates"
          onChange={handleMandateOptionChange}
          multiple
        >
          {
            mandates.map((row, idx) => {
              return (
                <MenuItem key={idx} value={row['uuid']}>Mandate-ID-{row['id']}</MenuItem>                
              )
            })
          }
        </Select>
      </FormControl>

      <input 
        type="file" 
        id="document"
      />

      <Button disabled={!isUploadAllowed} onClick={onUploadDocument}>
        Upload
      </Button>

    </div>
  );
}
export default UploadTest;
