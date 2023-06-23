import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import { Add } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Stack } from "@mui/material";
import colors from "assets/theme/base/colors";
import DashboardLayout from "layouts/DashboardLayout";
import CardWrapper from "slots/Cards/CardWrapper";
import HasPermissionButton from "slots/Custom/Buttons/HasPermissionButton";
import { GET_ROUTE_NAME, SET_PAGE_TITLE } from "helpers/Base";
import { HTTP_CLIENT, APIFY } from "helpers/Api";

export default function RatingModelList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  useEffect(() => {
    SET_PAGE_TITLE("Rating Model List");
  }, []);

  const getRatingModelData = () => {
    HTTP_CLIENT(APIFY("/v1/company_rating_model"), { params: {} })
      .then((data) => {
        const { company_rating_models } = data;
        setRows(company_rating_models);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getNevigateToInput = (company_uuid, model_uuid) => {
    navigate(GET_ROUTE_NAME("RATING_MODEL_INPUT", { uuid: company_uuid, modelUuid: model_uuid }));
  };

  useEffect(() => {
    getRatingModelData();
  }, []);

  const columns = [
    { field: "id", hide: true },
    {
      field: "company",
      headerName: "Company",
      width: 240,
      renderCell: (params) => {
        return <>{params.row.company ? params.row.company?.name : ""}</>;
      },
    },
    {
      field: "turnover",
      headerName: "Turnover(in Crores)",
      width: 160,
    },
    {
      field: "industry",
      headerName: "Industry",
      width: 200,
      renderCell: (params) => {
        return <>{params.row.industry ? params.row.industry?.name : ""}</>;
      },
    },
    {
      field: "model_type",
      headerName: "Model Type",
      width: 200,
      renderCell: (params) => {
        return <>{params.row.model_type ? params.row.model_type?.name : ""}</>;
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 220,
      renderCell: (params) => {
        return (
          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                background: params.row.status === "Forward to Group Head" ? "#3a86ea" : params.row.status === "Saved in draft" ? "#cd5487" : params.row.status === "Initiated" ? "#e7e158" : "#0fc000",
                width: "15px",
                height: "15px",
                borderRadius: "10px",
              }}
            ></div>
            {params.row.status}
          </div>
        );
      },
    },
    {
      field: "uuid",
      headerName: "",

      renderCell: (params) => {
        return (
          <div style={{ display: "flex" }}>
            <div style={{ margin: "auto 5px" }}>
              <IconButton
                size="medium"
                variant="contained"
                sx={{
                  borderRadius: "3px !important",
                  backgroundColor: colors.primary.main,
                  color: "white !important",
                  fontSize: "18px !important",
                  "&:hover": {
                    backgroundColor: "#4159de",
                  },
                }}
                onClick={() => {}}
              >
                <VisibilityIcon></VisibilityIcon>
              </IconButton>
            </div>
            <div style={{ margin: "auto 5px" }}>
              <IconButton
                size="medium"
                variant="contained"
                sx={{
                  borderRadius: "3px !important",
                  backgroundColor: colors.primary.main,
                  color: "white !important",
                  fontSize: "18px !important",
                  "&:hover": {
                    backgroundColor: "#4159de",
                  },
                }}
                onClick={() => getNevigateToInput(params.row.company.uuid, params.row.model_type.uuid)}
              >
                <EditIcon></EditIcon>
              </IconButton>
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <DashboardLayout>
      <CardWrapper
        headerTitle={"Rating Model List"}
        headerActionButton={() => {
          return <HasPermissionButton color="primary" permissions={["/dashboard/rating-modules/initiate-rating-model"]} route={GET_ROUTE_NAME("INITIATE_RATING_MODEL")} text={`Initiate Rating Model`} icon={<Add sx={{ fontSize: 40 }} />} />;
        }}
      >
        <Box sx={{ height: 550, padding: " 10px 25px" }}>
          <DataGrid
            components={{
              NoRowsOverlay: () => (
                <Stack height="100%" alignItems="center" justifyContent="center">
                  No rating model to show.
                </Stack>
              ),
            }}
            className="MuiDataGridCssAdjust"
            sx={{ fontSize: "13px !important" }}
            rows={rows}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
            disableMultipleSelection
            disableRowSelectionOnClick
          />
        </Box>
      </CardWrapper>
    </DashboardLayout>
  );
}
