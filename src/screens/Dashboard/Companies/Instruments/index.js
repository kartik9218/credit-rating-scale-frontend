import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
import ArgonSelect from "components/ArgonSelect";
import { ArgonTypography, ArgonBox } from "components/ArgonTheme";
import { APIFY, HTTP_CLIENT } from "helpers/Api";
import { GET_USER_PROPS, SET_PAGE_TITLE, GET_QUERY } from "helpers/Base";
import DashboardLayout from "layouts/DashboardLayout";
import CardWrapper from "slots/Cards/CardWrapper";
import CollapsibleTable from "./CollapsibleTable";

function CompanyInstruments() {
  const company_uuid = GET_QUERY("company-uuid");
  const [GHUsers, setGHUsers] = useState([]);
  const [Companies, setCompanies] = useState([]);
  const [instruments, setInstruments] = useState(undefined);
  const [showGH, setShowGH] = useState(true);
  const [SelectedCompany, setSelectedCompany] = useState(undefined);
  const [SelectedGH, setSelectedGH] = useState("")
  const [userId, setUserId] = useState(null)
  const [roleId, setRoleId] = useState(null)

  const fetchData = () => {
    HTTP_CLIENT(APIFY("/v1/companies"), { is_active: true }).then((data) => {
      let result = data.companies.map((company) => {
        if (company_uuid !== undefined && company.uuid === company_uuid) {
          fetchMandates({
            label: company.name,
            value: company.uuid,
          })
        }
        return {
          label: company.name,
          value: company.uuid,
        };
      });
      setCompanies(result);
    });

    HTTP_CLIENT(APIFY("/v1/roles/view_users"), {
      role: "Group Head",
    }).then((data) => {
      // setUserId(GET_USER_PROPS("uuid"))
      setRoleId(data.role.uuid)
      let GHdata = data.role?.users || [];
      let GHUsers = GHdata.map((user) => {
        return {
          label: user.full_name,
          value: user.uuid,
        };
      });
      setGHUsers(GHUsers);
    });
  };

  const fetchCompaniesBasedonRole = () => {
    HTTP_CLIENT(APIFY("/v1/companies/based_on_roles"), {
      params: {
        user_uuid: GET_USER_PROPS("uuid"),
        role_uuid: GET_USER_PROPS("uuid", "active_role")
      }
    }).then((data) => {
      let result = data.companies.map((company) => {
        return {
          label: company.company_name,
          value: company.company_uuid,
        };
      });
      setCompanies(result);
    });
  }

  const fetchCompanies = (opt) => {
    setUserId(opt.value)
    HTTP_CLIENT(APIFY("/v1/companies/based_on_roles"), {
      params: {
        user_uuid: opt.value,
        role_uuid: roleId
      }
    }).then((data) => {
      let result = data.companies.map((company) => {
        return {
          label: company.company_name,
          value: company.company_uuid,
        };
      });
      setInstruments(undefined)
      setSelectedCompany({})
      setCompanies(result);

    });
    setSelectedGH(opt);
  }

  const fetchMandates = (opt) => {
    HTTP_CLIENT(APIFY("/v1/companies/view_mandates"), {
      company_uuid: opt.value,
      is_active: true,
      is_verified: true,
    }).then((data) => {
      let mandates = data.mandates;
      let mandateIds = [];

      mandates.forEach((mandate) => {
        mandateIds.push(mandate.uuid);
      });
      HTTP_CLIENT(APIFY("/v1/transaction_instruments"), {
        params: { mandate_uuid: mandateIds, is_active: true }
      }).then(async (instrumentList) => {
        let transectionInstruments = [];
        for (let index in instrumentList.transaction_instruments) {
          let tis = instrumentList.transaction_instruments[index];
          let metadata = await HTTP_CLIENT(APIFY("/v1/transaction_instrument/rating_metadata"), {
            params: { transaction_instrument_uuid: tis.uuid }
          }).then((metadata) => {
            return metadata.rating_metadata;
          });
          tis.metadata = metadata;
          transectionInstruments.push(tis)
        }
        setInstruments(transectionInstruments);
      });
    });

    setSelectedCompany(opt);
  }

  useEffect(() => {

  }, [Companies])
  useEffect(() => {
    fetchData()
  }, [company_uuid])

  useEffect(() => {
    let role = GET_USER_PROPS("name", "active_role");
    SET_PAGE_TITLE("Instruments");
    let ajaxEvent = true;
    if (ajaxEvent) {
      if (role === "System Admin") {
        fetchData();
      } else {
        setUserId(GET_USER_PROPS("uuid"))
        setRoleId(GET_USER_PROPS("uuid", "active_role"))
        setShowGH(false)
        fetchCompaniesBasedonRole();
      }
    }
    return () => {
      ajaxEvent = false;
    };
  }, []);

  return (
    <>
      <DashboardLayout>
        <CardWrapper
          headerTitle={"Instruments"}
          headerActionButton={() => {
            return <></>;
          }}
        >
          <Box sx={{ margin: "-30px 0px 10px 0px" }}>
            <div style={{ padding: "20px" }}>
              <div style={{ display: "flex", gap: "0px 50px", marginBottom: "25px" }} className="MuiAutoCompleteCssAdjust">
                {showGH && (
                  <Grid item xs={12} sm={6}>
                    <ArgonBox mb={1} ml={0.5} lineHeight={0} display="inline-block">
                      <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                        Group Head*
                      </ArgonTypography>
                    </ArgonBox>

                    <ArgonSelect sx={{ width: "100%", borderRadius: "10px" }} placeholder="Select Group Head" options={GHUsers} onChange={fetchCompanies} required />
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <ArgonBox mb={1} lineHeight={0} display="inline-block">
                    <ArgonTypography component="label" variant="caption" fontWeight="bold" textTransform="capitalize">
                      Company*
                    </ArgonTypography>
                  </ArgonBox>

                  <ArgonSelect sx={{ width: "100%", borderRadius: "10px" }} placeholder="Select Company" options={Companies} onChange={fetchMandates} value={SelectedCompany} required />
                </Grid>
              </div>
            </div>
            {instruments && instruments.length > 0 && <CollapsibleTable instruments={instruments} company={SelectedCompany} />}
            {instruments && instruments.length === 0 && (
              <>
                <ArgonTypography component="h1" variant="caption" fontWeight="bold" textTransform="capitalize" textAlign="center" display="block" py={5} mt={5} fontSize={20}>
                  No Instruments assign to this company.
                </ArgonTypography>
              </>
            )}
            {!SelectedCompany && (
              <>
                <ArgonTypography component="h1" variant="caption" fontWeight="bold" textTransform="capitalize" textAlign="center" display="block" py={5} mt={5} fontSize={20}>
                  Please first Select Company to view instruments list.
                </ArgonTypography>
              </>
            )}
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  );
}

export default CompanyInstruments;
