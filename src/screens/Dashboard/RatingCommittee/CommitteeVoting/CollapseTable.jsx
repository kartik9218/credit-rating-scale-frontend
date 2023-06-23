import * as React from "react";
import ColumnHeader from "./ColumnHeader";
import PropTypes from "prop-types";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";
import { Box } from "@mui/material";
import { GET_DATA } from "helpers/Base";
import { GET_QUERY } from "helpers/Base";
const columns = ["Instrument", "Value (in Cr)", "Proposed Rating", "Vote", "Remarks", "Dissent", "Dissent Remark"];
const user = GET_DATA('user')

export default function CollapseTable({ Editable, mandate_uuid, ClickedCompany, committee_registers,SelectedVotingData, setCommittee_registers,ClickedMember }) {
  const fetchMandateData = async () => {
    HTTP_CLIENT(APIFY("/v1/voting/companies"), { params: { company_uuid: ClickedCompany.company_uuid,rating_committee_meeting_uuid:GET_QUERY('uuid') } }).then((response) => {
      if (response["success"]) {
     
        response["committee_registers"] = response["committee_registers"].map((val) => {
          return {
            ...val,
            instrument: val.instrument_text,
            value: val.instrument_size_number,
            transaction_instrument_uuid: val.transaction_instrument_uuid,
            proposedrating: val.long_term_rating_recommendation
              ? val.long_term_rating_recommendation + ' ' + val.long_term_outlook_recommendation
              : val.short_term_rating_recommendation,
            vote: '',
            remarks: val.remarks,
            dissent: val.dissent,
            dissentRemarks: '',
          }
        });
        let obj = {};
        for (let i = 0; i < response["committee_registers"].length; i++) {
          if (!obj[response["committee_registers"][i]["mandate_id"]]) obj[response["committee_registers"][i]["mandate_id"]] = [];

          obj[response["committee_registers"][i]["mandate_id"]].push(response["committee_registers"][i]);
        }

        setCommittee_registers({ ...obj });
      
      }
    });
  };
  React.useEffect(() => {
    fetchMandateData();
    console.log(SelectedVotingData, 'SelectedVotingData')
  }, []);

  return (
    <Box style={{ border: '2px solid #eee'}}>
      <ColumnHeader
        columns={columns}
        Editable={Editable}
        committee_registers={committee_registers}
        ClickedCompany={ClickedCompany}
        ClickedMember={ClickedMember}
        SelectedVotingData={SelectedVotingData}
      />
    </Box>
  )
}

CollapseTable.propTypes = {
  Editable: PropTypes.boolean,
  mandate_uuid: PropTypes.string,
  ClickedCompany: PropTypes.object,
  committee_registers: PropTypes.object,
  setCommittee_registers: PropTypes.func,
  ClickedMember: PropTypes.object,
  SelectedVotingData: PropTypes.object,
}
