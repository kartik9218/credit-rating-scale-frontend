import { DashboardLayout } from 'layouts'
import ActivityExecutor from './ActivityExecutor'
import { GET_QUERY } from 'helpers/Base'
import { useLocation } from 'react-router-dom'

const Execution = () => {
  const location = useLocation()
  const activityTitle = location.state?.activityTitle || ''
 
  const getActivityProps = () => {
    switch (GET_QUERY('activity-code')) {
      case '10100':
        return {
          activityTitle,
          userType: 'Group Head',
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10150':
        return {
          activityTitle,
          userType: 'Rating Analyst',
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10200':
        return {
          activityTitle,
          allowUserSelection: false,
          allowUpload: false,
          userType: 'Rating Analyst',
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
          allowSelectionColumn:{quartely:true, annualy:true, dateSelection:true, acceptance:false}
        }
      case '10250':  
        return {
          //here need to upload two docs
          activityTitle,
          allowUserSelection: true,
          userType: 'Group Head',
          allowUpload: true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10300':
        return {
          activityTitle,
          allowUserSelection: true,
          userType: 'Quality Control', 
          allowUpload: true,
          allowDownloadDocuments:true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10350':
        return {
          activityTitle,
          allowUserSelection: true,
          userType: 'Quality Control',
          allowUpload: false,
          allowDownloadDocuments:true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
        case '10400':
          return {
            activityTitle,
            allowUserSelection: true,
            allowDownloadDocuments:true,
          userType: 'Group Head',
          allowUpload: true, 
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10450':
        return {
          activityTitle,
          allowUserSelection: false,
          userType: '',
          allowUpload: false,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10500':
        return {
          activityTitle,
          allowUserSelection: false,
          userType: '',
          allowUpload: false,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10550':
        return {
          activityTitle,
          allowUserSelection: false,
          userType: 'Compliance',
          allowUpload: false,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10600':
        return {
          activityTitle,
          allowUserSelection: false,
          userType: '',
          allowUpload: false,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10650':
        return {
          activityTitle,
          allowUserSelection: true,
          userType: 'Rating Analyst',
          allowUpload: true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10700':
        return {
          activityTitle,
          allowUserSelection: true,
          userType: 'Rating Analyst',
          allowUpload: true,
          allowDownloadDocuments:true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
          allowSelectionColumn:{quartely:false, annualy:false, dateSelection:true, acceptance:true}
        }
        case '10750':
          return {
            activityTitle,
            allowUserSelection: true,
            allowUpload:true,
            allowDownloadDocuments:true,
            userType: 'Group Head',
            activityCode: GET_QUERY('activity-code'),
            companyUuid: GET_QUERY('uuid'),
            ratingUuid: GET_QUERY('rating-uuid'),
          }  
      case '10800':
        return {
          activityTitle,
          allowUserSelection: true,
          userType: 'Rating Analyst',
          allowDownloadDocuments:true,
          allowUpload: true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10850':
        return {
          activityTitle,
          allowUserSelection: true,
          userType: 'Group Head',
          allowUpload: true,
          allowDownloadDocuments:true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10900':
        return {
          activityTitle,
          allowUserSelection: true,
          userType: 'Rating Analyst',
          allowUpload: true,
          allowDownloadDocuments: true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '10950':
        return {
          activityTitle,
          allowUserSelection: false,
          userType: 'Rating Analyst',
          allowUpload: true,
          allowDownloadDocuments:true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
      case '11000':
        return {
          activityTitle,
          allowUserSelection: false,
          userType: '',
          allowUpload: true,
          allowDownloadDocuments:true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
          allowSelectionColumn:{quartely:false, annualy:false, dateSelection:true, acceptance:true}
        }
      case '11050':
        return {
          activityTitle,
          allowUserSelection: true,
          userType: 'Group Head',
          allowUpload: true,
          allowDownloadDocuments:true,
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
        }
        case '11100':
          return {
            activityTitle,
            allowUserSelection: false,
            userType: '',
            allowUpload: false,
            allowDownloadDocuments:true,
            activityCode: GET_QUERY('activity-code'),
            companyUuid: GET_QUERY('uuid'),
            ratingUuid: GET_QUERY('rating-uuid'),
         }
        default : return {
          activityTitle,
          userType: 'Group Head',
          activityCode: GET_QUERY('activity-code'),
          companyUuid: GET_QUERY('uuid'),
          ratingUuid: GET_QUERY('rating-uuid'),
          allowSelectionColumn:{quartely:false, annualy:false, dateSelection:false, acceptance:false}
        }   
    }
  }

  return (
    <DashboardLayout>
      <ActivityExecutor {...getActivityProps()} />
    </DashboardLayout>
  )
}

export default Execution
