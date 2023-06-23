import { useEffect, useState } from "react";
import { ArrowBackRounded } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { SET_PAGE_TITLE, GET_ROUTE_NAME, GET_QUERY } from "helpers/Base";
import { APIFY, HTTP_CLIENT } from "helpers/Api";
import { DashboardLayout } from "layouts";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import { ArgonTypography } from "components/ArgonTheme";
import CardWrapper from "slots/Cards/CardWrapper";
import moment from "moment";
import { FORMATE_NUMBER, FORMATE_DATE } from "helpers/Base";

function CompanyMandateView() {

  const [mandate, setMandate] = useState(undefined);
  const [title, setTitle] = useState("Mandate Details");
  const [mandateDocuments, setMandateDocuments] = useState(undefined);
  
  const uuid = GET_QUERY("uuid");
  const company_uuid = GET_QUERY("company-uuid");
  const fetchData = () => {
    HTTP_CLIENT(APIFY("/v1/companies/mandates/view"), {
      params: {
        uuid: uuid,
      },
    }).then((mandateData) => {
      setMandate(mandateData.mandate);
      if(mandateData.mandate.mandate_id){
        setTitle("Mandate - " + mandateData.mandate.mandate_id)
      }else{
        setTitle("Mandate ")

      }
      HTTP_CLIENT(APIFY(`/v1/mandates/view_documents`), {
        mandate_uuid: uuid
      }).then((data) => {
        setMandateDocuments(data.mandate_documents);
      });

    });
  };

  useEffect(() => {
    SET_PAGE_TITLE(title);

    let isSubscribed = true;
    if (isSubscribed) {
      fetchData();
    }
    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <>
      <DashboardLayout breadcrumbTitle={title}>
        <CardWrapper
          headerTitle={title}
          headerActionButton={() => {
            return <HasPermissionButton color="primary" route={GET_ROUTE_NAME("LIST_MANDATE",{company_uuid: company_uuid})} permissions={["/dashboard/company/mandate"]} text={`Back to Mandate`} icon={<ArrowBackRounded />} />;
          }}
        >
          <>
            {mandate && (
              <Grid item xs={12} px={2} sx={{ height: "calc(100vh - 32vh)", overflowY: "scroll" }}>
                <ArgonTypography >Mandate Details</ArgonTypography>
                <hr></hr>
                <Grid container item xs={12} px={2} sx={{ paddingTop: "7px" }}>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Company Name :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        paddingLeft: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      {mandate.company_mandate.name}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Mandate Id :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        paddingLeft: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      {mandate.mandate_id}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Mandate Date :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        paddingLeft: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      {FORMATE_DATE(mandate.mandate_date)}
                    </ArgonTypography>
                  </Grid>
                </Grid>
                <Grid container item xs={12} px={2}>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Mandate Received Date :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        paddingLeft: "5px",
                        display: "block",
                      }}
                    >
                      {FORMATE_DATE(mandate.received_date)}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Business Developer :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {`${mandate.business_developer.full_name} (${mandate.business_developer.employee_code})`}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Rating Team Head :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        paddingLeft: "5px",
                        display: "block",
                      }}
                    >
                      {`${mandate.rating_head.full_name} (${mandate.rating_head.employee_code})`}
                    </ArgonTypography>
                  </Grid>
                </Grid>
                <Grid container item xs={12} px={2}>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Mandate Source :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {mandate.mandate_source}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Branch Office :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {mandate.branch_office.name}
                    </ArgonTypography>
                  </Grid>
                </Grid>
                <ArgonTypography paddingTop="10px">Type of Mandate and Fee detail</ArgonTypography>
                <hr></hr>
                <Grid container item xs={12} px={2} sx={{ paddingTop: "7px" }}>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Type of Mandate :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {mandate.mandate_type}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Total Size (in Cr.) :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {FORMATE_NUMBER(mandate.total_size)}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Initial Fee Charged (in INR) :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {FORMATE_NUMBER(mandate.initial_fee_charged)}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Basis Point :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {FORMATE_NUMBER(mandate.bases_point)}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Surveillance Fee Charged (in INR) :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {FORMATE_NUMBER(mandate.surveillance_fee_charged)}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Surveillance Basis Point  :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {FORMATE_NUMBER(mandate.surveillance_bases_point)}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Minimum Surveillance Fee (in INR) :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {mandate.minimum_surveillance_fee ? FORMATE_NUMBER(mandate.minimum_surveillance_fee) : 0}
                    </ArgonTypography>
                  </Grid>
                </Grid>
                <ArgonTypography paddingTop="10px">Instrument/Facility Details</ArgonTypography>
                <hr></hr>
                {mandate.transaction_instruments.map((instrument, key) => {
                  return (
                    <Grid container item xs={12} px={2} key={key} sx={{ paddingTop: "9px" }}>
                      <Grid item xs={12} sm={3} display="flex">
                        <ArgonTypography
                          component="h4"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          sx={{
                            marginBottom: "5px",
                            fontSize: "14px",
                            display: "block",
                          }}
                        >
                          Category :
                        </ArgonTypography>
                        <ArgonTypography
                          component="p"
                          variant="caption"
                          sx={{
                            marginBottom: "5px",
                            fontSize: "15px",
                            display: "block",
                            paddingLeft: "5px",
                          }}
                        >
                          {instrument.instrument_category?.category_name}
                        </ArgonTypography>
                      </Grid>
                      <Grid item xs={12} sm={4} display="flex">
                        <ArgonTypography
                          component="h4"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          sx={{
                            marginBottom: "5px",
                            fontSize: "14px",
                            display: "block",
                          }}
                        >
                          Sub Category :
                        </ArgonTypography>
                        <ArgonTypography
                          component="p"
                          variant="caption"
                          sx={{
                            marginBottom: "5px",
                            fontSize: "15px",
                            display: "block",
                            paddingLeft: "5px",
                          }}
                        >
                          {instrument.instrument_sub_category?.category_name}
                        </ArgonTypography>
                      </Grid>
                      <Grid item xs={12} sm={3} display="flex">
                        <ArgonTypography
                          component="h4"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          sx={{
                            marginBottom: "5px",
                            fontSize: "14px",
                            display: "block",
                          }}
                        >
                          Instrument :
                        </ArgonTypography>
                        <ArgonTypography
                          component="p"
                          variant="caption"
                          sx={{
                            marginBottom: "5px",
                            fontSize: "15px",
                            display: "block",
                            paddingLeft: "5px",
                          }}
                        >
                          {instrument.instrument?.name}
                        </ArgonTypography>
                      </Grid>
                      <Grid item xs={12} sm={2} display="flex">
                        <ArgonTypography
                          component="h4"
                          variant="caption"
                          fontWeight="bold"
                          textTransform="capitalize"
                          sx={{
                            marginBottom: "5px",
                            fontSize: "14px",
                            display: "block",
                          }}
                        >
                          Size (in Cr.):
                        </ArgonTypography>
                        <ArgonTypography
                          component="p"
                          variant="caption"
                          sx={{
                            marginBottom: "5px",
                            fontSize: "15px",
                            display: "block",
                            paddingLeft: "5px",
                          }}
                        >
                          {FORMATE_NUMBER(instrument.instrument_size)}
                        </ArgonTypography>
                      </Grid>
                    </Grid>
                  );
                })}
                <ArgonTypography paddingTop="20px">Files</ArgonTypography>
                <hr></hr>
                <Grid container item xs={12} px={2}>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Duly Signed Mandate :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {mandateDocuments?.mandate_part_1_document && (
                        <span
                          className="hover-effect"
                          style={{
                            height: "100%",
                            width: "100%",
                            fontSize: "16px",
                            overflow: "hidden",
                            textAlign: "end",
                            cursor: "pointer",
                            textOverflow: "ellipsis",
                            marginRight: "6px",
                          }}
                          onClick={() => window.open(mandateDocuments.mandate_part_1_document, "_blank")}
                        >
                          mandate-document-part-1.pdf
                        </span>
                      )}
                    </ArgonTypography>
                  </Grid>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Part Signed Mandate :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {mandateDocuments?.mandate_part_2_document && (
                        <span
                          className="hover-effect"
                          style={{
                            height: "100%",
                            width: "100%",
                            fontSize: "16px",
                            overflow: "hidden",
                            textAlign: "end",
                            cursor: "pointer",
                            textOverflow: "ellipsis",
                            marginRight: "6px",
                          }}
                          onClick={() => window.open(mandateDocuments.mandate_part_2_document, "_blank")}
                        >
                          mandate-document-part-2.pdf
                        </span>
                      )}
                    </ArgonTypography>
                  </Grid>
                </Grid>
                <Grid container item xs={12} px={2}>
                  <Grid item xs={12} sm={4} display="flex" py={1}>
                    <ArgonTypography
                      component="h4"
                      variant="caption"
                      fontWeight="bold"
                      textTransform="capitalize"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                      }}
                    >
                      Status :
                    </ArgonTypography>
                    <ArgonTypography
                      component="p"
                      variant="caption"
                      sx={{
                        marginBottom: "5px",
                        fontSize: "16px",
                        display: "block",
                        paddingLeft: "5px",
                      }}
                    >
                      {mandate.is_active ? "Active" : "Inactive"}
                    </ArgonTypography>
                  </Grid>
                  {!mandate.is_active &&
                    <Grid item xs={12} sm={4} display="flex" py={1}>
                      <ArgonTypography
                        component="h4"
                        variant="caption"
                        fontWeight="bold"
                        textTransform="capitalize"
                        sx={{
                          marginBottom: "5px",
                          fontSize: "16px",
                          display: "block",
                        }}
                      >
                        Remark :
                      </ArgonTypography>
                      <ArgonTypography
                        component="p"
                        variant="caption"
                        sx={{
                          marginBottom: "5px",
                          fontSize: "16px",
                          display: "block",
                          paddingLeft: "5px",
                        }}
                      >
                        {mandate.remark}
                      </ArgonTypography>
                    </Grid>
                  }
                </Grid>
              </Grid>
            )}
          </>
        </CardWrapper>
      </DashboardLayout>
    </>
  );
}
export default CompanyMandateView;
