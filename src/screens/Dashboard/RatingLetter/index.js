import { Add, Edit, RemoveRedEyeOutlined } from '@mui/icons-material'
import { Box } from '@mui/material'
import ArgonBadge from 'components/ArgonBadge'
import { ArgonButton } from 'components/ArgonTheme'
import { ArgonBox } from 'components/ArgonTheme'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { DashboardLayout } from 'layouts'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CardWrapper from 'slots/Cards/CardWrapper'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import DataTable from 'slots/Tables/DataTable'

const TemplateList = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([
  {
    name_of_template:"Initial Rating Letter",
    last_edited:"24 Dec 2022",
    author:"Neha Chandola",
    status:"Active",
    uuid:"9324-234-234-324"
  },
  {
    name_of_template:"Provisional Communication",
    last_edited:"25 Dec 2022",
    author:"Rajneesh Rathore",
    status:"InActive",
    uuid:"6531-234-234-224"
  }
  ]);
  const columns = [
    { accessor: "name_of_template", Header: "Name of Template" },
    { accessor: "last_edited", Header: "Last Edited" },
    { accessor: "author", Header: "Author" },
    { accessor: "status", Header: "Status", Cell: row => {
        return (
            <ArgonBadge badgeContent={row.cell.value} color={row.cell.value === "Active" ? "success" : "error"}/>
        )
    } },
    {
        accessor: "uuid",
        Header: "Action",
        align: "right",
        Cell: (row) => {
          return (
            <ArgonBox display="flex" flexDirection="row" justifyContent="space-between" gap={"10px"}>
             <ArgonButton width={"auto"} height="auto" color="primary">
                <Edit/> 
            </ArgonButton>   
             <ArgonButton width={"auto"} height="auto" color="primary">
                <RemoveRedEyeOutlined/> 
            </ArgonButton>   
            {/* <HasPermissionButton
                color="primary"
                permissions={[""]}
                text={`Edit`}
                icon={<Edit />}
              />
              <HasPermissionButton
                color="primary"
                permissions={[""]}
                text={`Edit`}
                icon={<RemoveRedEyeOutlined />}
              /> */}
            </ArgonBox>
          );
        },
      },

  ]  
  return (
      <DashboardLayout>
        <CardWrapper
         headerTitle={"Template List"}
         headerSubtitle={"Rating Letter"}
         headerActionButton={() => {
           return <ArgonButton color="primary" onClick={() => navigate(GET_ROUTE_NAME("LETTER_CONFIGURATOR"))}> 
             <Add/>
             Add Template
             </ArgonButton>
            // <HasPermissionButton
            //  icon={<Add/>}
            //  text={"Add Template"}
            //  permission={["/dashboard/rating-letter/template-list/create"]}
            //  route={GET_ROUTE_NAME("ADD_TEMPLATE")}
            // />
         }}
        >
          <Box>
          <DataTable
          table={{
            columns: columns,
            rows: rows,
          }}
          canSearch={true}
          customHeight={"calc(100vh - 30vh)"}
        />
          </Box>
        </CardWrapper>
      </DashboardLayout>
    )
}

export default TemplateList