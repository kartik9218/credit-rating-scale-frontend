import React, { useEffect, useState } from "react";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import { Button, Typography, Autocomplete, TextField } from "@mui/material";
import { Box } from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";
import { SET_PAGE_TITLE, FORMATE_DATE } from "helpers/Base";
import DashboardLayout from "layouts/DashboardLayout";
import CardWrapper from "slots/Cards/CardWrapper";
import { HTTP_CLIENT } from "helpers/Api";
import { APIFY } from "helpers/Api";

const CommitteeMinutes = () => {
  const [row, setRows] = useState([]);
  const [committeeTypeOptions, setCommitteeTypeOptions] = useState([])
  const [committeeCategories, setCommitteeCategories] = useState([])
  const [SelectedCommitteeType, setSelectedCommitteeType] = useState('')
  const [SelectedMeeting, setSelectedMeeting] = useState('')
  const [FilterMeetingOptions, setFilterMeetingOptions] = useState([])
  const [SelectedCommitteeCategory, setSelectedCommitteeCategory] = useState('')
  const [MeetingOptions, setMeetingOptions] = useState([])
  const [Flag, setFlag] = useState(false)

  useEffect(() => {
    SET_PAGE_TITLE("Committee Minutes");
  }, []);

  const getMinutes = (M_ID) => {
    HTTP_CLIENT(APIFY("/v1/rating_committee_meeting_registers"), { params: { rating_committee_meeting_uuid: M_ID } })
      .then((data) => {
        const { rating_committee_meeting_register } = data;
        rating_committee_meeting_register.forEach((rRegister, key) => {
          rating_committee_meeting_register[key].id = key + 1;
        })
        setRows(rating_committee_meeting_register);
      })
      .catch((err) => {

      });
  };

  const fetchRatingCommitteeTypes = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_types'), { params: { is_active: true } }).then((response) => {
      const rating_committee_types = response['rating_committees']
      let temp = rating_committee_types.map((val) => {
        return {
          label: val.name,
          value: val.uuid,
        }
      })

      setCommitteeTypeOptions([...temp])
    })
  }

  const fetchRatingCommitteeCategories = async () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meeting_categories'), {
      params: { is_active: true },
    }).then((response) => {
      const rating_committee_meeting_categories = response['rating_committee_meeting_categories']
      let temp = []
      temp.push(
        rating_committee_meeting_categories.map((val) => {
          return {
            label: val.name,
            value: val.uuid,
          }
        }),
      )
      setCommitteeCategories(...temp)
    })
  }


  const getMeetings = () => {
    HTTP_CLIENT(APIFY('/v1/rating_committee_meetings'), { params: {} })
      .then((data) => {
        const { rating_committee_meetings } = data
        let temp = []
        temp = rating_committee_meetings.map((val) => {
          let time = new Date()
          time.setHours(Number(val.meeting_at.substr(11, 2)))
          time.setMinutes(Number(val.meeting_at.substr(14, 2)))

          return {
            ...val,
            value: val.uuid,
            label: `${val.meeting_at.substr(0, 10)} ${time.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            })} `,
          }
        })

        setMeetingOptions([...temp])
      })
      .catch((err) => { })
  }

  useEffect(() => {
    if (
      SelectedCommitteeCategory.value?.length &&
      SelectedCommitteeType.value?.length &&
      SelectedMeeting.value?.length &&
      FilterMeetingOptions?.length
    ) {
      getMinutes(SelectedMeeting.value)
    }
  }, [SelectedMeeting, FilterMeetingOptions])
  useEffect(() => {
    setFilterMeetingOptions(
      [...MeetingOptions].filter((val) => {
        if (
          SelectedCommitteeCategory.label == val.rating_committee_meeting_category?.name &&
          SelectedCommitteeType?.label == val.rating_committee_type?.name &&
          val.is_active
        ) {
          return val
        }
      }),
    )
    if (Flag) setSelectedMeeting('')
    if (MeetingOptions?.length) setFlag(true)
  }, [SelectedCommitteeCategory, SelectedCommitteeType, MeetingOptions])

  useEffect(() => {
    fetchRatingCommitteeTypes()
    fetchRatingCommitteeCategories()
    getMeetings()
  }, []);
  const columns = [
    {
      field: "company_name",
      headerName: "Name of Company",
      width: 200,
    },

    {
      field: "mandate_id",
      headerName: "Mandate ID",
      width: 200,
    },
    {
      field: "rating_date",
      headerName: "Rating Date",
      width: 200,
      renderCell: (params) => { return <>{FORMATE_DATE(params.value)}</> },
    },
    {
      field: "committee_type",
      headerName: "Committee Type",
      width: 200,
    },
    {
      field: "category",
      headerName: "Category",
      width: 200,
    },
    {
      field: "rating_assigned",
      headerName: "Rating Assigned",
      width: 200,
    },
    {
      field: "outlook",
      headerName: "Outlook",
      width: 200,
    },
    {
      field: "instrument_text",
      headerName: "Instrument/Facility",
      width: 200,
    },
    {
      field: "instrument_size_number",
      headerName: "Size (in Cr.)",
      width: 200,
    },
    {
      field: "agenda_type",
      headerName: "Agenda Type",
      width: 200,
    },
    {
      field: "long_term_rating_recommendation",
      headerName: "Rating Recommendation (LT)",
      width: 200,
    },
    {
      field: "long_term_outlook_recommendation",
      headerName: "Outlook",
      width: 200,
    },

    {
      field: "short_term_outlook_recommendation",
      headerName: "Rating Recommendation (ST)",
      width: 200,
    },
    {
      field: "location",
      headerName: "Location",
      width: 200,
    },
    {
      field: "long_term_rating_assgined_text",
      headerName: "Model Rating (LT)",
      width: 200,
    },
    {
      field: "outlook2",
      headerName: "Outlook",
      width: 200,
    },
    {
      field: "short_term_rating_assgined_text",
      headerName: "Model Rating (ST)",
      width: 200,
    },
    {
      field: "previous_rating",
      headerName: "Previous Rating (LT)",
      width: 200,
    },
    {
      field: "outlook3",
      headerName: "Outlook",
      width: 200,
    },
    {
      field: "previousRating2",
      headerName: "Previous Rating (ST)",
      width: 200,
    },
    {
      field: "meeting_type",
      headerName: "Meeting Type",
      width: 200,
    },
    {
      field: "voting_status",
      headerName: "Voting Status",
      width: 200,
    },
  ];

  return (
    <>
      <DashboardLayout>
        <CardWrapper
          headerTitle="Committee Minutes"
          headerActionButton={() => { }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
            <Box sx={{ display: 'flex' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '5px 10px 1px 0px' }}>
                <Typography component="label" variant="caption" fontWeight="bold" sx={{ marginBottom: '10px' }}>
                  Rating Committee Type
                </Typography>
                <Autocomplete
                  disableClearable
                  disablePortal
                  options={committeeTypeOptions}
                  value={SelectedCommitteeType}
                  onChange={(e, val) => {
                    setSelectedCommitteeType(val)
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="Committee Type" />}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '5px 10px 10px 0px' }}>
                <Typography
                  component="label"
                  variant="caption"
                  fontWeight="bold"
                  sx={{ marginBottom: '10px', marginLeft: '0px' }}
                >
                  Rating Committee Category
                </Typography>
                <Autocomplete
                  disableClearable
                  disablePortal
                  options={committeeCategories}
                  value={SelectedCommitteeCategory}
                  onChange={(e, val) => {
                    setSelectedCommitteeCategory(val)
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="Committee Category" />}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '250px', margin: '5px 10px 10px 0px' }}>
                <Typography
                  component="label"
                  variant="caption"
                  fontWeight="bold"
                  sx={{ marginBottom: '10px', marginLeft: '0px' }}
                >
                  Rating Committee Date and Time
                </Typography>
                <Autocomplete
                  disableClearable
                  disablePortal
                  options={[...FilterMeetingOptions].sort((a, b) => new Date(b.label) - new Date(a.label))}
                  value={SelectedMeeting}
                  onChange={(e, val) => {
                    setSelectedMeeting(val)
                  }}
                  renderInput={(params) => <TextField {...params} placeholder="Meeting Date and Time" />}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'end', flexDirection: 'column', width: '450px !important', marginTop: "1.6rem", paddingRight: "5px" }}>
              <Button
                sx={{
                  backgroundColor: "#F4F7FF",
                  color: "#344767",
                  borderRadius: "0.25rem",
                  border: "1px solid #A8B8D8",
                  padding: "0.6rem 1.4rem",
                  "&:hover": {
                    backgroundColor: "#F4F7FF",
                    color: "#344767",
                  },
                }}
              >
                <UploadFileOutlinedIcon
                  sx={{
                    mr: "0.25rem",

                    fontSize: "1.4rem !important",
                  }}
                />
                Generate Minutes
              </Button>
            </Box>
          </Box>
          <Box sx={{ height: 600, px: "0.8rem" }}>
            <DataGrid checkboxSelection rows={row} getRowId={(row) => row.id} sx={{ fontSize: "13px" }} columns={columns}

              hideFooter
            />
          </Box>
        </CardWrapper>
      </DashboardLayout>
    </>
  );
};

export default CommitteeMinutes;
