import { INTERACTION_TYPE } from './constants'

const basicDetailSchema = {
  company_name: '',
  short_code: '',
  cin: '',
  macro_economic_indicator: { label: 'Select Macro Economic Indicator...', value: '' },
  sector: { label: 'Select Sector...', value: '' },
  industry: { label: 'Select Industry...', value: '' },
  sub_industry: { label: 'Select Sub Industry...', value: '' },
  legal_status: { label: 'Select Legal Status/Constitution...', value: '' },
  group: { label: 'Select Group...', value: '' },
  former_name: '',
  pan: '',
  tan: '',
  gst: '',
  date_of_incorporation: '',
  controlling_office: '',
  website: '',
  is_infomerics_client: true,
  sez: true,
  tags: [],
  // company_type: { label: 'Select Company Type...', value: '' },
  registered: true,
}

const addressDetailSchema = {
  address_type: { label: 'Select Address Type...', value: '' },
  address_1: '',
  address_2: '',
  landmark: '',
  pincode: '',
  city: { label: 'Select City...', value: '' },
  state: { label: 'Select State...', value: '' },
  country: { label: 'Select Country...', value: '' },
}

const keyContactDetailsSchema = {
  contact_person_name: '',
  email: '',
  mobile: '',
  landline: '',
  department: { label: 'Select Department...', value: '' },
  designation: { label: 'Select Designation...', value: '' },
  primary_contact: true,
  provisional_communication_letter: true,
  rating_letter: true,
  nds_emails: true,
  press_release: true,
  is_key_managerial_person: true,
}

const ListingDetailSchema = {
  exchange_name: { label: 'Select Exchange Name...', value: '' },
  scrip_code: '',
  isin: '',
  listing_status: { label: 'Select Listing Status...', value: '' },
  is_active: true,
}

const boardOfDirectorSchema = {
  director_name: '',
  din: '',
  position: '',
  director_function: '',
  qualification: '',
  is_wilful_defaulter: false,
  director_status: true,
  total_experiance: '',
  past_experiance: '',
  date_of_joining: '',
}

const shareholderPatternSchema = {
  existing_shareholder_details: { label: 'Select Date...', value: '' },
  as_on_date: '',
  holding_type: '',
  holder_name: '',
  pledge_share: '',
  holding_percentage: '',
  is_active: true,
}

const stakeHolderSchema = {
  stakeholder_type: { label: 'Select Stakeholder Type...', value: '' },
  stakeholder_name: { label: 'Select Stakeholder Name...', value: '' },
  contact_name: '',
  department: { label: 'Select Department...', value: '' },
  designation: { label: 'Select Designation...', value: '' },
  email: '',
  mobile: '',
  landline: '',
  country: { label: 'Select Country...', value: '' },
  state: { label: 'Select State...', value: '' },
  city: { label: 'Select City...', value: '' },
  gender: { label: 'Select Gender...', value: '' },
  is_active: true,
}

const subsidiarySchema = {
  parent_company: { label: 'Select Parent Company...', value: '' },
  relationship: { label: 'Select Relationship...', value: '' },
  company_name: { label: 'Select...', value: '' },
  stake: '',
  is_active: true,
}

const getDiligenceSchema = () => {
  return {
    company: {},
    interactionDateTime: '',
    interactionType: {},
    phone: '',
    meetingType: {},
    contactPerson: '',
  }
}

const dueDiligenceAddSchema = (currentInteractionType) => {
  const dueDiligence = {
    selectedInteractionType: { label: '', value: '' },
    selectedCompanyName: { label: '', value: '' },
    interactionDate: '',
    selectedStakeholderName: { label: '', value: '' },
    branchName: '',
    placeOfVisit: '',
    selectedMeetingType: { label: '', value: '' },
    phone: '',
    remark: '',
    document: '',
    contactNames: [],
    contactEmail: [],
  }
  return dueDiligence
}

const ratingMasterShema = {
  ratingSymbol: '',
  ratingScale: { label: 'Select...', value: '' },
  description: '',
  grade: '',
  weightage: '',
  is_active: true,
}

const ratingCategorySchema = {
  symbolTypeCategory: '',
  is_active: true,
}

const createMinutesSchema = {
  discussionParagraph: '',
  commentsParagraph: '',
}

export {
  basicDetailSchema,
  addressDetailSchema,
  ListingDetailSchema,
  stakeHolderSchema,
  boardOfDirectorSchema,
  keyContactDetailsSchema,
  shareholderPatternSchema,
  subsidiarySchema,
  dueDiligenceAddSchema,
  getDiligenceSchema,
  ratingMasterShema,
  createMinutesSchema,
  ratingCategorySchema,
}
