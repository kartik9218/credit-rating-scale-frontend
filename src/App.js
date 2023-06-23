import { useEffect, useState, lazy } from 'react'
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'
import { ThemeProvider } from '@mui/material/styles'
import themeLight from 'assets/theme'
import { Modal } from '@mui/material'
import 'styles/index.css'
// Helpers
import { GET_USER_PROPS } from 'helpers/Base'
import { ArgonBox } from 'components/ArgonTheme'
import UploadTest from 'screens/Tests/UploadTest'

// Screens
const InteractionTypeEntity = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/InteractionType/InteractionTypeEntity'),
)
const InteractionType = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/InteractionType'))
const InteractionQuestionEntity = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/InteractionQuestions/InteractionQuestionEntity'),
)
const InteractionQuestion = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/InteractionQuestions'))
const RatingCommitteeCategoryEntity = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/RatingCommitteeCategories/RatingCommitteeCategoryEntity'),
)
const RatingCommitteeCategories = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/RatingCommitteeCategories/index'),
)

const InitiateRatingCycle = lazy(() => import('screens/Dashboard/Companies/InitiateRatingCycle'))
const MandateLifeCycle = lazy(() => import('screens/Dashboard/WorkflowManagement/MandateLifeCycle'))
const DueDiligenceHistory = lazy(() => import('screens/Dashboard/DueDiligence/View'))
const SendToCommittee = lazy(() => import('screens/Dashboard/RatingCommittee/SendToCommittee'))
const CommitteeVoting = lazy(() => import('screens/Dashboard/RatingCommittee/CommitteeVoting'))
const RatingVerification = lazy(() => import('screens/Dashboard/RatingCommittee/RatingVerification'))
// const ViewAgenda = lazy(() => import("screens/Dashboard/RatingCommittee/Meetings/Modals/ViewAgenda"));
const CommitteeMember = lazy(() => import('screens/Dashboard/RatingCommittee/Meetings/Modals/CommitteeMember'))
const CommitteeMinutes = lazy(() => import('screens/Dashboard/RatingCommittee/CommitteeMinutes'))

const DueDiligenceAdd = lazy(() => import('screens/Dashboard/DueDiligence/add'))
const SubIndustriesEntity = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/SubIndustries/SubIndustriesEntity'),
)
const SubCategoryEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/SubCategory/SubCategoryEntity'))
const CategoryEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Categories/CategoryEntity'))
const MasterIndustriesEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Industries/IndustriesEntity'))
const DepartmentsEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Departments/DepartmentsEntity'))
const MacroEconomicIndicatorEntity = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/MacroEconomicIndicator/MacroEconomicIndicatorEntity'),
)
const CountriesEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Countries/CountriesEntity'))
const StatesEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/States/StatesEntity'))
const InstrumentsEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Instrument/InstrumentEntity'))
const RiskTypeEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/RiskType/RiskTypeEntity'))
const SectorsEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Sectors/SectorsEntity'))
const CitiesEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Cities/CityEntity'))
const NotchingModelEntity = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/NotchingModels/NotchingModelEntity'),
)

const FinancialYear = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/FinancialYear'))
const FinancialYearEntity = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/FinancialYear/FinancialYearEntity'),
)
const RatingProcess = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/RatingProcess'))
const RatingProcessEntity = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/RatingProcess/RatingProcessEntity'),
)
const BranchOffice = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/BranchOffice'))
const BranchOfficeEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/BranchOffice/BranchOfficeEntity'))
const Login = lazy(() => import('screens/Auth/Login'))
const DashboardRedirect = lazy(() => import('screens/Dashboard/redirect'))
const Dashboard = lazy(() => import('screens/Dashboard'))
const Companies = lazy(() => import('screens/Dashboard/Companies'))
const CompanyOnboarding = lazy(() => import('screens/Dashboard/Companies/CompanyOnboarding'))
const Subsidiary = lazy(() => import('screens/Dashboard/Companies/Subsidiary'))
const SubsidiaryEntity = lazy(() => import('screens/Dashboard/Companies/Subsidiary/SubsidiaryEntity'))

const CompanyEdit = lazy(() => import('screens/Dashboard/Companies/CompanyEdit'))
const UserSettings = lazy(() => import('screens/Dashboard/Settings/UserSettings'))
const Roles = lazy(() => import('screens/Dashboard/Roles'))
const RoleCreate = lazy(() => import('screens/Dashboard/Roles/create'))
const RoleEdit = lazy(() => import('screens/Dashboard/Roles/edit'))
const CompanyProfile = lazy(() => import('screens/Dashboard/Companies/CompanyProfile'))
const Users = lazy(() => import('screens/Dashboard/Admin/Users'))
const UserEntity = lazy(() => import('screens/Dashboard/Admin/Users/UserEntity'))
const UserView = lazy(() => import('screens/Dashboard/Admin/Users/view'))
const Permissions = lazy(() => import('screens/Dashboard/Admin/Permissions'))
const PermissionAdd = lazy(() => import('screens/Dashboard/Admin/Permissions/create'))
const PermissionEdit = lazy(() => import('screens/Dashboard/Admin/Permissions/edit'))
const Navigations = lazy(() => import('screens/Dashboard/Admin/Navigations'))
const NavigationAdd = lazy(() => import('screens/Dashboard/Admin/Navigations/create'))
const NavigationEdit = lazy(() => import('screens/Dashboard/Admin/Navigations/edit'))
const Masters = lazy(() => import('screens/Dashboard/Settings/Masters'))
const CompanyMandate = lazy(() => import('screens/Dashboard/Companies/mandate'))
const CompanyMandateView = lazy(() => import('screens/Dashboard/Companies/mandate/view'))
const CompanyMandateAdd = lazy(() => import('screens/Dashboard/Companies/mandate/create'))
const CompanyInstrumentsAdd = lazy(() => import('screens/Dashboard/Companies/Instruments/create'))
const CompanyInstruments = lazy(() => import('screens/Dashboard/Companies/Instruments'))
const MasterCreate = lazy(() => import('screens/Dashboard/Settings/Masters/create'))
const MasterEdit = lazy(() => import('screens/Dashboard/Settings/Masters/edit'))
const ActivityMaster = lazy(() => import('screens/Dashboard/WorkflowManagement/ActivityMaster'))
const WorkflowMaintenance = lazy(() => import('screens/Dashboard/WorkflowManagement/WorkflowMaintenance'))
const Execution = lazy(() => import('screens/Dashboard/InboxModule/Execution'))
const RatingCommitteeTypes = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/RatingCommitteeTypes'))
const RatingCommitteeTypesEntity = lazy(() =>
  import('screens/Dashboard/Companies/Masters/Manage/RatingCommitteeTypes/RatingCommitteeTypesEntity'),
)
const BankManage = lazy(() => import('screens/Dashboard/Companies/BankManage'))
const Configurator = lazy(() => import('screens/Dashboard/RatingModules/Configurator'))
const ConfiguratorAdd = lazy(() => import('screens/Dashboard/RatingModules/Configurator/create'))
const Version = lazy(() => import('screens/Dashboard/RatingModules/Version'))
const ModelMapping = lazy(() => import('screens/Dashboard/RatingModules/ModelMapping'))
const AddModelMap = lazy(() => import('screens/Dashboard/RatingModules/ModelMapping/AddModelMap'))
const RatingModelInput = lazy(() => import('screens/Dashboard/RatingModules/RatingModelInput'))
const IndustryMapping = lazy(() => import('screens/Dashboard/RatingModules/ModelMapping/IndustryMapping'))
const Inbox = lazy(() => import('screens/Dashboard/InboxModule'))
//Masters
const MasterIndustries = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Industries'))
const SubIndustries = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/SubIndustries'))
const Categories = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Categories'))
const NotchingModels = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/NotchingModels'))
const SubCategory = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/SubCategory'))
const Departments = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Departments'))
const MacroEconomicIndicator = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/MacroEconomicIndicator'))
const Countries = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Countries'))
const States = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/States'))
const Cities = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Cities'))
const Instruments = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Instrument'))
const RiskType = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/RiskType'))
const RatingMasters = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/RatingMasters'))
const RatingMasterEntity = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/RatingMasters/RatingMasterEntity'))
const Sectors = lazy(() => import('screens/Dashboard/Companies/Masters/Manage/Sectors'))

const WorkflowView = lazy(() => import('screens/Dashboard/WorkflowManagement/WorkflowMaintenance/WorkflowView'))
const RatingModelList = lazy(() => import('screens/Dashboard/RatingModules/RatingModelList'))
const InitiateRatingModel = lazy(() => import('screens/Dashboard/RatingModules/InitiateRatingModel'))
const SmartCard = lazy(() => import('slots/Cards/SmartCard'))
const AttendanceConfiguration = lazy(() => import('screens/Dashboard/RatingCommittee/AttendanceConfiguration'))
const MeetingStatus = lazy(() => import('screens/Dashboard/RatingCommittee/Meetings'))
const DueDiligence = lazy(() => import('screens/Dashboard/DueDiligence/add'))
const VotingStatus = lazy(() => import('screens/Dashboard/RatingCommittee/VotingStatusScreen'))
const CommitteeAgenda = lazy(() => import('screens/Dashboard/RatingCommittee/CommitteeAgenda'))
const RatingRegister = lazy(() => import('screens/Dashboard/RatingCommittee/RatingRegister'))
const TemplateList = lazy(() => import('screens/Dashboard/RatingLetter'))
const LetterConfigurator = lazy(() => import('screens/Dashboard/RatingLetter/LetterConfigurator'))
const TransferCases = lazy(() => import('screens/Dashboard/Portfolio/TransferCases'))

const DueDiligenceEntity = lazy(() => import('screens/Dashboard/DueDiligence/DueDiligenceEntity'))

const NotFound = lazy(() => import('screens/NotFound'))

const AuthGuard = () => {
  const token = GET_USER_PROPS('access_token', 'active_role') !== null
  return token ? <Outlet /> : <Navigate to="/" />
}

AuthGuard.propTypes = {
  element: PropTypes.element,
}

export default function App() {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleShowSmartModal = (event) => {
    if (event.key === 'Escape') handleClose()
    if (event.key === 'z' && event.ctrlKey) handleOpen()
  }

  useEffect(() => {
    document.addEventListener('keydown', (event) => handleShowSmartModal(event))
    return () => {
      document.removeEventListener('keydown', (event) => handleShowSmartModal(event))
    }
  }, [])

  return (
    <ThemeProvider theme={themeLight}>
      <Routes>
        <Route path={'/'} element={<Login />} />

        <Route path="/" element={<AuthGuard />}>
          <Route path={'/redirect'} element={<DashboardRedirect />} />
          <Route path={'/dashboard'} element={<Dashboard />} />
          <Route path={'/dashboard/rating-modules/configurators'} element={<Configurator />} />
          <Route path={'/dashboard/rating-modules/configurators/create'} element={<ConfiguratorAdd />} />
          <Route path={'/dashboard/rating-modules/version'} element={<Version />} />
          <Route path={'/dashboard/rating-modules/model-mapping'} element={<ModelMapping />} />
          <Route path={'/dashboard/rating-modules/add-model-map'} element={<AddModelMap />} />
          <Route path={'/dashboard/rating-modules/model-mapping/industry-mapping/edit'} element={<IndustryMapping />} />
          <Route path={'/dashboard/companies/view'} element={<CompanyProfile />} />
          <Route path={'/dashboard/workflow-management/activity-master'} element={<ActivityMaster />} />
          <Route path={'/dashboard/workflow-management/workflow-maintenance'} element={<WorkflowMaintenance />} />
          <Route path={'/dashboard/workflow-management/workflow/view'} element={<WorkflowView />} />
          <Route path={'/dashboard/execute'} element={<Execution />} />
          <Route path={'/dashboard/initiate-rating-cycle'} element={<InitiateRatingCycle />} />
          <Route path={'/dashboard/company/master/notching-model/edit'} element={<NotchingModelEntity />} />
          <Route path={'/dashboard/company/master/notching-model/create'} element={<NotchingModelEntity />} />
          <Route path={'/dashboard/company/master/notching-models'} element={<NotchingModels />} />
          <Route path={'/dashboard/company/master/industries'} element={<MasterIndustries />} />
          <Route path={'/dashboard/company/master/industries'} element={<MasterIndustries />} />
          <Route path={'/dashboard/company/master/industries/create'} element={<MasterIndustriesEntity />} />
          <Route path={'/dashboard/company/master/industries/edit'} element={<MasterIndustriesEntity />} />
          <Route path={'/dashboard/company/master/interaction-types'} element={<InteractionType />} />
          <Route path={'/dashboard/company/master/interaction-types/create'} element={<InteractionTypeEntity />} />
          <Route path={'/dashboard/company/master/interaction-types/edit'} element={<InteractionTypeEntity />} />
          <Route path={'/dashboard/company/master/interaction-questions'} element={<InteractionQuestion />} />
          <Route path={'/dashboard/company/master/interaction-question/create'} element={<InteractionQuestionEntity />} />
          <Route path={'/dashboard/company/master/interaction-question/edit'} element={<InteractionQuestionEntity />} />
          <Route path={'/dashboard/company/master/rating-committee-categories'} element={<RatingCommitteeCategories />} />
          <Route
            path={'/dashboard/company/master/rating-committee-categories/create'}
            element={<RatingCommitteeCategoryEntity />}
          />
          <Route
            path={'/dashboard/company/master/rating-committee-categories/edit'}
            element={<RatingCommitteeCategoryEntity />}
          />
          <Route path={'/dashboard/company/master/rating-committee-types'} element={<RatingCommitteeTypes />} />
          <Route path={'/dashboard/company/master/rating-committee-types/create'} element={<RatingCommitteeTypesEntity />} />
          <Route path={'/dashboard/company/master/rating-committee-types/edit'} element={<RatingCommitteeTypesEntity />} />
          <Route path={'/dashboard/company/master/sub_industries'} element={<SubIndustries />} />
          <Route path={'/dashboard/company/master/sub_industries/create'} element={<SubIndustriesEntity />} />
          <Route path={'/dashboard/company/master/sub_industries/edit'} element={<SubIndustriesEntity />} />
          <Route path={'/dashboard/company/master/categories'} element={<Categories />} />
          <Route path={'/dashboard/company/master/categories/create'} element={<CategoryEntity />} />
          <Route path={'/dashboard/company/master/categories/edit'} element={<CategoryEntity />} />
          <Route path={'/dashboard/company/master/rating-process'} element={<RatingProcess />} />
          <Route path={'/dashboard/company/master/rating-process/create'} element={<RatingProcessEntity />} />
          <Route path={'/dashboard/company/master/rating-process/edit'} element={<RatingProcessEntity />} />
          <Route path={'/dashboard/company/master/financial-year'} element={<FinancialYear />} />
          <Route path={'/dashboard/company/master/financial-year/create'} element={<FinancialYearEntity />} />
          <Route path={'/dashboard/company/master/financial-year/edit'} element={<FinancialYearEntity />} />
          <Route path={'/dashboard/company/master/sub_categories'} element={<SubCategory />} />
          <Route path={'/dashboard/company/master/sub_categories/create'} element={<SubCategoryEntity />} />
          <Route path={'/dashboard/company/master/sub_categories/edit'} element={<SubCategoryEntity />} />
          <Route path={'/dashboard/company/master/departments'} element={<Departments />} />
          <Route path={'/dashboard/company/master/departments/create'} element={<DepartmentsEntity />} />
          <Route path={'/dashboard/company/master/departments/edit'} element={<DepartmentsEntity />} />
          <Route path={'/dashboard/company/master/macro_economic_indicator'} element={<MacroEconomicIndicator />} />
          <Route
            path={'/dashboard/company/master/macro_economic_indicator/create'}
            element={<MacroEconomicIndicatorEntity />}
          />
          <Route
            path={'/dashboard/company/master/macro_economic_indicator/edit'}
            element={<MacroEconomicIndicatorEntity />}
          />
          <Route path={'/dashboard/company/master/countries'} element={<Countries />} />
          <Route path={'/dashboard/company/master/countries/create'} element={<CountriesEntity />} />
          <Route path={'/dashboard/company/master/countries/edit'} element={<CountriesEntity />} />
          <Route path={'/dashboard/company/master/states'} element={<States />} />
          <Route path={'/dashboard/company/master/states/create'} element={<StatesEntity />} />
          <Route path={'/dashboard/company/master/states/edit'} element={<StatesEntity />} />
          <Route path={'/dashboard/company/master/cities'} element={<Cities />} />
          <Route path={'/dashboard/company/master/cities/create'} element={<CitiesEntity />} />
          <Route path={'/dashboard/company/master/cities/edit'} element={<CitiesEntity />} />
          <Route path={'/dashboard/company/master/sectors'} element={<Sectors />} />
          <Route path={'/dashboard/company/master/sectors/create'} element={<SectorsEntity />} />
          <Route path={'/dashboard/company/master/sectors/edit'} element={<SectorsEntity />} />
          <Route path={'/dashboard/company/master/risk_type'} element={<RiskType />} />
          <Route path={'/dashboard/company/master/risk_type/create'} element={<RiskTypeEntity />} />
          <Route path={'/dashboard/company/master/risk_type/edit'} element={<RiskTypeEntity />} />
          <Route path={'/dashboard/company/master/instruments'} element={<Instruments />} />
          <Route path={'/dashboard/company/master/instruments/create'} element={<InstrumentsEntity />} />
          <Route path={'/dashboard/company/master/instruments/edit'} element={<InstrumentsEntity />} />
          <Route path={'/dashboard/company/master/branch-offices'} element={<BranchOffice />} />
          <Route path={'/dashboard/company/master/branch-offices/create'} element={<BranchOfficeEntity />} />
          <Route path={'/dashboard/company/master/branch-offices/edit'} element={<BranchOfficeEntity />} />
          <Route path={'/dashboard/company/master/rating-symbol'} element={<RatingMasters />} />
          <Route path={'/dashboard/company/master/rating-symbol/create'} element={<RatingMasterEntity />} />
          <Route path={'/dashboard/company/master/rating-symbol/edit'} element={<RatingMasterEntity />} />
          <Route path={'/dashboard/company/subsidiary'} element={<Subsidiary />} />
          <Route path={'/dashboard/company/subsidiary/create'} element={<SubsidiaryEntity />} />
          <Route path={'/dashboard/company/subsidiary/edit'} element={<SubsidiaryEntity />} />
          <Route path={'/dashboard/company/edit'} element={<CompanyOnboarding />} />
          <Route path={'/dashboard/company/create'} element={<CompanyOnboarding />} />
          <Route path={'/dashboard/company/onboarding'} element={<Companies />} />
          <Route path={'/dashboard/company/mandate/create'} element={<CompanyMandateAdd />} />
          <Route path={'/dashboard/company/management'} element={<Companies />} />
          <Route path={'/dashboard/company/mandate/edit'} element={<CompanyMandateAdd />} />
          <Route path={'/dashboard/company/mandate/view'} element={<CompanyMandateView />} />
          <Route path={'/dashboard/company/mandate'} element={<CompanyMandate />} />
          <Route path={'/dashboard/company/instruments/create'} element={<CompanyInstrumentsAdd />} />
          <Route path={'/dashboard/company/instruments'} element={<CompanyInstruments />} />
          <Route path={'/dashboard/company/bank_manage'} element={<BankManage />} />
          <Route path={'/dashboard/companies/:uuid'} element={<CompanyProfile />} />
          <Route path={'/dashboard/companies/edit/:uuid'} element={<CompanyEdit />} />
          <Route path={'/dashboard/settings'} element={<UserSettings />} />
          <Route path={'/dashboard/settings/masters'} element={<Masters />} />
          <Route path={'/dashboard/settings/masters/create'} element={<MasterCreate />} />
          <Route path={'/dashboard/settings/masters/edit'} element={<MasterEdit />} />
          <Route path={'/dashboard/roles'} element={<Roles />} />
          <Route path={'/dashboard/roles/create'} element={<RoleCreate />} />
          <Route path={'/dashboard/roles/edit'} element={<RoleEdit />} />
          <Route path={'/dashboard/users'} element={<Users />} />
          <Route path={'/dashboard/users/create'} element={<UserEntity />} />
          <Route path={'/dashboard/users/edit'} element={<UserEntity />} />
          <Route path={'/dashboard/users/view'} element={<UserView />} />
          <Route path={'/dashboard/permissions'} element={<Permissions />} />
          <Route path={'/dashboard/permissions/create'} element={<PermissionAdd />} />
          <Route path={'/dashboard/permissions/edit'} element={<PermissionEdit />} />
          <Route path={'/dashboard/navigations'} element={<Navigations />} />
          <Route path={'/dashboard/navigations/create'} element={<NavigationAdd />} />
          <Route path={'/dashboard/navigations/edit'} element={<NavigationEdit />} />
          <Route path={'/dashboard/rating-committee/attendance-configuration'} element={<AttendanceConfiguration />} />
          <Route path={'/dashboard/rating-committee/meetings'} element={<MeetingStatus />} />
          <Route path={'/dashboard/rating-committee/meetings/committee-member'} element={<CommitteeMember />} />
          <Route path="/dashboard/rating-committee/meetings/view-agenda" element={<CommitteeAgenda />} />
          <Route path="/dashboard/rating-committee/meetings/rating-register" element={<RatingRegister />} />
          <Route path="/dashboard/rating-committee/rating-register" element={<RatingRegister />} />
          <Route path="/dashboard/rating-committee/meetings/view-committee-minutes" element={<CommitteeMinutes />} />
          <Route path="/dashboard/rating-committee/committee-minutes" element={<CommitteeMinutes />} />
          <Route path={'/dashboard/inbox'} element={<Inbox />} />
          <Route path={'/dashboard/rating-committee/meetings/committee-voting'} element={<CommitteeVoting />} />
          <Route path={'/dashboard/rating-committee/committee-voting'} element={<CommitteeVoting />} />
          <Route path={'/dashboard/rating-committee/send-to-committee'} element={<SendToCommittee />} />

        <Route path={'/dashboard/due-diligence/history'} element={<DueDiligenceHistory />} />
        <Route path={'/dashboard/due-diligence/create'} element={<DueDiligenceAdd />} />
        <Route path={'/dashboard/due-diligence'} element={<DueDiligenceAdd />} />
        <Route path={'/dashboard/due-diligence'} element={<DueDiligenceAdd />} />
        <Route path={'/dashboard/rating-committee/rating-verification'} element={<RatingVerification />} />
        <Route path={'/dashboard/rating-committee/voting-status'} element={<VotingStatus />} />
        <Route path={'/dashboard/rating-committee/committee-agenda'} element={<CommitteeAgenda />} />
        <Route path={'/dashboard/rating-modules/rating-model-list'} element={<RatingModelList />} />
        <Route path={'/dashboard/rating-modules/initiate-rating-model'} element={<InitiateRatingModel />} />
        <Route path={'/dashboard/rating-modules/rating-input'} element={<RatingModelInput />} />
        <Route path={'/dashboard/rating-letter/template-list'} element={<TemplateList />} />
        <Route path={'/dashboard/rating-letter/letter-configurator'} element={<LetterConfigurator />} />
        <Route path={'/dashboard/mandate-life-cycle'} element={<MandateLifeCycle />} />
        <Route path={'/dashboard/portfolio/transfer-cases'} element={<TransferCases />} />
        <Route path={'/not-found'} element={<NotFound />} />
        
        <Route path={'/upload-test'} element={<UploadTest />} />

        <Route path="*" element={<Navigate to="/not-found" />} />
        </Route>
      </Routes>
      <Modal open={open} onClose={handleClose} className="modal-wrapper">
        <ArgonBox>
          <SmartCard onCloseModal={handleClose} />
        </ArgonBox>
      </Modal>
    </ThemeProvider>
  )
}
