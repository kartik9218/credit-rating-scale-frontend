import React, { useEffect, useState } from 'react'
import DashboardLayout from 'layouts/DashboardLayout'
import CardWrapper from 'slots/Cards/CardWrapper'
import { SET_PAGE_TITLE } from 'helpers/Base'
import HasPermissionButton from 'slots/Custom/Buttons/HasPermissionButton'
import { GET_ROUTE_NAME } from 'helpers/Base'
import { GET_QUERY } from 'helpers/Base'
import DiligenceResponse from './TypesOfAddScreens/index'
import { ArrowBackRounded } from '@mui/icons-material'
import { useLocation, useNavigate } from 'react-router-dom'
import { HAS_PERMISSIONS } from 'helpers/Base'
import ArgonBox from 'components/ArgonBox'
import ArgonButton from 'components/ArgonButton'

const DueDiligence = () => {
  const uuid = GET_QUERY('uuid')
  const operation = GET_QUERY('operation')
  const [companyAndInteractionData, setCompanyAndInteractionData] = useState({ companyData: {} })
  const navigate = useNavigate()
  let { state } = useLocation()

  useEffect(() => {
    SET_PAGE_TITLE(`Due Diligence ${operation === 'view' ? 'View' : operation === 'edit' ? 'Edit' : 'Create'}`)
  }, [operation])

  return (
    <DashboardLayout>
      <CardWrapper
        headerTitle={`Due Diligence ${operation === 'view' ? 'View' : operation === 'edit' ? 'Edit' : 'Create'}`}
        headerActionButton={() => {
          return (
            <>
              {HAS_PERMISSIONS(['/dashboard/due-diligence/history']) && (
                <>
                  <ArgonBox paddingRight="10px">
                    <ArgonButton
                      color="primary"
                      onClick={() => navigate('/dashboard/due-diligence/history', { state: { companyAndInteractionData } })}
                    >
                      <ArrowBackRounded />
                      <ArgonBox margin={'3px'} />
                      Back to Due Diligences
                    </ArgonButton>
                  </ArgonBox>
                </>
              )}
              {/* <HasPermissionButton
                color="primary"
                permissions={['/dashboard/due-diligence/history']}
                route={GET_ROUTE_NAME('LIST_DILIGENCE')}
                text={`Back to Due Diligences`}
                icon={<ArrowBackRounded />}
              /> */}
            </>
          )
        }}
      >
        {uuid ? (
          <DiligenceResponse
            operation={operation}
            uuid={uuid}
            companyAndInteractionData={companyAndInteractionData}
            setCompanyAndInteractionData={setCompanyAndInteractionData}
          />
        ) : state ? (
          <DiligenceResponse
            companyAndInteractionData={companyAndInteractionData}
            state={state}
            setCompanyAndInteractionData={setCompanyAndInteractionData}
          />
        ) : (
          <DiligenceResponse />
        )}
      </CardWrapper>
    </DashboardLayout>
  )
}

export default DueDiligence
