import * as Yup from 'yup'
import { TAB, INTERACTION_TYPE } from './constants'

const getUserSchema = (loginType) => {
  return Yup.object().shape({
    full_name: Yup.string().max(30, 'Too Long!').required('Name field cannot be left empty'),
    gender: Yup.object()
      .shape({
        label: Yup.string().nullable(),
        value: Yup.string().nullable(),
      })
      .nullable(),
    date_of_birth: Yup.date().required('Date of Birth cannot be left empty'),
    marital_status: Yup.object()
      .shape({
        label: Yup.string().nullable(),
        value: Yup.string().nullable(),
      })
      .nullable(),
    contact_number: Yup.string()
      .required('Contact number cannot be left empty')
      .matches(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, 'Please enter a valid contact number'),
    email: Yup.string()
      .required('Email field cannot be left empty')
      .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/, 'Invalid email'),
    login_type: Yup.object().shape({
      label: Yup.string().required('Login type is required'),
      value: Yup.string().required('Login type is required'),
    }),
    password:
      loginType === 'AZURE'
        ? null
        : Yup.string()
            .required('Password cannot be left empty')
            .matches(
              /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
              'Password must contain at least 8 characters, one uppercase, one number and one special case character',
            ),
    employment_status: Yup.object()
      .shape({
        label: Yup.string().nullable(),
        value: Yup.string().nullable(),
      })
      .nullable(),
    address: Yup.string().required('Address field cannot be left empty'),
    office_address: Yup.string(),
    date_of_joining: Yup.date().required('Date of joining cannot be left empty'),
    selected_role: Yup.array()
      .of(
        Yup.object()
          .shape({
            label: Yup.string().nullable(),
            value: Yup.string().nullable(),
          })
          .nullable(),
      )
      .nullable(),
    department: Yup.object()
      .shape({
        label: Yup.string().nullable(),
        value: Yup.string().nullable(),
      })
      .nullable(),
    designation: Yup.object()
      .shape({
        label: Yup.string().nullable(),
        value: Yup.string().nullable(),
      })
      .nullable(),
    location: Yup.object()
      .shape({
        label: Yup.string().nullable(),
        value: Yup.string().nullable(),
      })
      .nullable(),
    office_contact_number: Yup.string(),
    first_reporting_person: Yup.object()
      .shape({
        label: Yup.string().nullable(),
        value: Yup.string().nullable(),
      })
      .nullable(),
    is_active: Yup.bool(),
  })
}

const getCompanyOnboardingSchema = (activeTab, legalStatusRef) => {
  switch (activeTab) {
    case TAB.BASIC_DETAIL:
      return Yup.object().shape({
        company_name: Yup.string().required('Company Name is required'),
        short_code: Yup.string().nullable(),
        legal_status: Yup.object()
          .shape({
            label: Yup.string().nullable(),
            value: Yup.string().nullable(),
          })
          .nullable(),
        cin: Yup.string().when('legal_status', {
          is: (status) =>
            legalStatusRef?.label === 'Partnership' ||
            legalStatusRef?.label === 'Proprietorship' ||
            legalStatusRef?.label === 'Limited Liability Partnership' ||
            legalStatusRef?.label === 'Limited Liability Company',
          then: Yup.string()
            .matches(
              '^([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$',
              'Please enter a valid CIN number',
            )
            .notRequired(),
          otherwise: Yup.string()
            .matches(
              '^([LUu]{1})([0-9]{5})([A-Za-z]{2})([0-9]{4})([A-Za-z]{3})([0-9]{6})$',
              'Please enter a valid CIN number',
            )
            .required('CIN number is required'),
        }),
        macro_economic_indicator: Yup.object().shape({
          label: Yup.string().required('Is required'),
          value: Yup.string().required('Macro Economic Indicator is required'),
        }),
        sector: Yup.object().shape({
          label: Yup.string().required('Is required'),
          value: Yup.string().required('Sector is required'),
        }),
        industry: Yup.object().shape({
          label: Yup.string().required('Is required'),
          value: Yup.string().required('Industry is required'),
        }),
        sub_industry: Yup.object()
          .shape({
            label: Yup.string(),
            value: Yup.string(),
          })
          .nullable(),
        legal_status: Yup.object()
          .shape({
            label: Yup.string().nullable(),
            value: Yup.string().nullable(),
          })
          .nullable(),
        group: Yup.object()
          .shape({
            label: Yup.string(),
            value: Yup.string(),
          })
          .nullable(),
        former_name: Yup.string().nullable(),
        pan: Yup.string().when('is_infomerics_client', {
          is: (is_infomerics_client) => is_infomerics_client === true,
          then: Yup.string()
            .required('PAN number is required')
            .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Please enter a valid PAN number'),
          otherwise: Yup.string()
            .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Please enter a valid PAN number')
            .notRequired(),
        }),
        tan: Yup.string()
          .matches(
            /(?:(?=(^[a-zA-Z]{5}\d{4}[a-zA-Z]{1}$))|(?=(^[a-zA-Z]{4}[0-9]{5}[a-zA-Z]{1}?$)))/,
            'Please enter a valid TAN number',
          )
          .nullable(),
        gst: Yup.string().when(['registered', 'sez'], {
          is: (registered, sez) => registered || sez,
          then: Yup.string()
            .required('Primary GST is required')
            .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number'),
          otherwise: Yup.string()
            .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GST number')
            .notRequired(),
        }),
        date_of_incorporation: Yup.date().nullable(),
        controlling_office: Yup.string().nullable(),
        website: Yup.string().nullable(),
        is_infomerics_client: Yup.boolean(),
        sez: Yup.boolean(),
        tags: Yup.array()
          .of(
            Yup.object().shape({
              label: Yup.string(),
              value: Yup.string(),
            }),
          )
          .nullable(),
        company_type: Yup.object()
          .shape({
            label: Yup.string(),
            value: Yup.string(),
          })
          .nullable(),
        registered: Yup.boolean(),
      })
    case TAB.ADDRESS_DETAIL:
      return Yup.object().shape({
        address_type: Yup.object().shape({
          label: Yup.string().required('Is required'),
          value: Yup.string().required('Address type is required'),
        }),
        address_1: Yup.string().required('Address one is required'),
        address_2: Yup.string(),
        landmark: Yup.string(),
        pincode: Yup.string()
          .required('Pincode is required')
          .matches(/^[1-9]{1}[0-9]{2}\s{0,1}[0-9]{3}$/, 'Please enter a valid pincode number'),
        city: Yup.object().shape({
          label: Yup.string().required('Is required'),
          value: Yup.string().required('City is required'),
        }),
        state: Yup.object().shape({
          label: Yup.string().required('Is required'),
          value: Yup.string().required('State is required'),
        }),
        country: Yup.object().shape({
          label: Yup.string().required('Is required'),
          value: Yup.string().required('Country is required'),
        }),
      })
    case TAB.LISTING_DETAIL:
      return Yup.object().shape({
        exchange_name: Yup.object().shape({
          label: Yup.string().required('Is Required'),
          value: Yup.string().required('Exchange Name is required'),
        }),
        scrip_code: Yup.string().required('Scrip Code is required'),
        isin: Yup.string()
          .required('ISIN is required')
          .matches(/^[A-Z]{2}([A-Z0-9]){9}[0-9]$/, 'Please enter a valid ISIN number'),
        listing_status: Yup.object().shape({
          label: Yup.string().notRequired(),
          value: Yup.string().notRequired(),
        }).nullable(),
        is_active: Yup.boolean().notRequired(),
      })
    case TAB.KEYCONTACT_DETAILS:
      return Yup.object().shape({
        contact_person_name: Yup.string().required('Contact person name is required'),
        email: Yup.string()
          .required('Email is required')
          .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/, 'Invalid email'),
        mobile: Yup.string()
          .matches(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, 'Please enter a valid mobile number')
          .notRequired(),
        landline: Yup.string(),
        department: Yup.object().shape({
          label: Yup.string(),
          value: Yup.string(),
        }).nullable(),
        designation: Yup.object().shape({
          label: Yup.string(),
          value: Yup.string(),
        }).nullable(),
        primary_contact: Yup.bool(),
        provisional_communication_letter: Yup.bool(),
        rating_letter: Yup.bool(),
        nds_emails: Yup.bool(),
        press_release: Yup.bool(),
        is_key_managerial_person: Yup.bool(),
      })
    case TAB.BOARD_DIRECTOR:
      return Yup.object().shape({
        director_name: Yup.string().required('Director name is required'),
        din: Yup.string().required('Din is required'),
        position: Yup.string().required('BOD Position is required'),
        director_function: Yup.string(),
        qualification: Yup.string(),
        is_wilful_defaulter: Yup.bool(),
        director_status: Yup.bool(),
        total_experiance: Yup.number(),
        past_experiance: Yup.number(),
        date_of_joining: Yup.date().nullable().notRequired(),
      })
    case TAB.SHAREHOLDER_PATTERN:
      return Yup.object().shape({
        existing_shareholder_details: Yup.object().shape({
          label: Yup.string(),
          value: Yup.string(),
        }),
        as_on_date: Yup.date().required('Date is required'),
        holding_type: Yup.object().shape({
          label: Yup.string().required('Is required'),
          value: Yup.string().required('Holding Type is required'),
        }),
        holder_name: Yup.string(),
        pledge_share: Yup.string(),
        holding_percentage: Yup.number()
          .min(0.01, 'Holding percentage cannot be zero or negative')
          .max(100, 'Holding Percentage cannot exceed 100')
          .required('Percentage is required'),
        is_active: Yup.boolean().notRequired(),
      })
    case TAB.STAKEHOLDER_DETAILS:
      return Yup.object().shape({
        stakeholder_type: Yup.object().shape({
          label: Yup.string().required('required'),
          value: Yup.string().required('Stakeholder Type is required'),
        }),
        contact_name: Yup.string().required('Conatct Name is required'),
        stakeholder_name: Yup.object().shape({
          label: Yup.string().required('required'),
          value: Yup.string().required('Stakeholder Name is required'),
        }),
        gender: Yup.object()
          .shape({
            label: Yup.string(),
            value: Yup.string(),
          })
          .nullable(),
        department: Yup.object()
          .shape({
            label: Yup.string(),
            value: Yup.string(),
          })
          .nullable(),
        designation: Yup.object().shape({
          label: Yup.string(),
          value: Yup.string(),
        }).nullable(),
        email: Yup.string()
          .required('Email is required')
          .matches(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/, 'Invalid email'),
        mobile: Yup.string().matches(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/, 'Please enter a valid mobile number'),
        landline: Yup.string(),
        country: Yup.object()
          .shape({
            label: Yup.string(),
            value: Yup.string(),
          })
          .nullable(),
        state: Yup.object()
          .shape({
            label: Yup.string(),
            value: Yup.string(),
          })
          .nullable(),
        city: Yup.object()
          .shape({
            label: Yup.string(),
            value: Yup.string(),
          })
          .nullable(),
        is_active: Yup.bool(),
      })
    default:
      return null
  }
}

const getSubsidiarySchema = () => {
  return Yup.object().shape({
    parent_company: Yup.object().shape({
      label: Yup.string().required('Is Required'),
      value: Yup.string().required('Parent Company is required'),
    }),
    relationship: Yup.object().shape({
      label: Yup.string().required('Is Required'),
      value: Yup.string().required('Relationship is required'),
    }),
    company_name: Yup.object().shape({
      label: Yup.string().required('Is Required'),
      value: Yup.string().required('Company Name is required'),
    }),
    stake: Yup.number().min(0.1, 'Stake percent cannot be 0').required('Stake field cannot be left empty'),
    is_active: Yup.boolean(),
  })
}

const getMandateSchema = () => {
  return Yup.object().shape({
    company_uuid: Yup.object().shape({
      label: Yup.string().required('Is Required'),
      value: Yup.string().required('Company is required'),
    }),
    bd_uuid: Yup.object().shape({
      label: Yup.string().required('Is Required'),
      value: Yup.string().required('Business Development Coordinator is required'),
    }),
    rh_uuid: Yup.object().shape({
      label: Yup.string().required('Is Required'),
      value: Yup.string().required('Rating Head  is required'),
    }),
    mandate_source: Yup.string().required('Mandate Source  is required'),
    mandate_date: Yup.string().required('Mandate date is required'),
    received_date: Yup.string().required('Mandate received date is required'),
    mandate_type: Yup.object().shape({
      label: Yup.string().required('Is Required'),
      value: Yup.string().required('Mandate type is required'),
    }),
    total_size: Yup.number().min(0).required('Total Size is required'),
    initial_fee_charged: Yup.number().min(0).required('Initial Fee Charged is required'),
    bases_point: Yup.number()
      .min(0, 'base point cannot be less then 0')
      .max(100, 'base point cannot be greater then 100')
      .nullable(),
    surveillance_fee_charged: Yup.number().min(0).nullable(),
    minimum_surveillance_fee: Yup.number().min(0).nullable(),
    surveillance_bases_point: Yup.number()
      .min(0, 'base point cannot be less then 0')
      .max(100, 'base point cannot be greater then 100')
      .nullable(),
    is_active: Yup.boolean().nullable(),
    remark: Yup.string().nullable(),
  })
}

const getDueDiligenceAddSchema = (currentInteractionType = '') => {
  return Yup.object().shape({
    selectedInteractionType: Yup.object().shape({
      label: Yup.string().required(),
      value: Yup.string().required(),
    }),
    selectedCompanyName: Yup.object().shape({
      label: Yup.string().required(),
      value: Yup.string().required(),
    }),
    interactionDate: Yup.date().required(),
    phone: Yup.string()
      .required()
      .matches(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/),
    contactNames: Yup.array()
      .of(
        Yup.object().shape({
          label: Yup.string().required(),
          value: Yup.string().required(),
        }),
      )
      .min(1, 'Please select contact name')
      .required(),
    contactEmail: Yup.array()
      .of(
        Yup.object().shape({
          label: Yup.string().required().email(),
          value: Yup.string().required(),
        }),
      )
      .min(1, 'Please select conatct email')
      .required(),
    remark: Yup.string(),
    branchName: currentInteractionType === 'Banker' ? Yup.string().required() : null,
    selectedStakeholderName:
      currentInteractionType === 'Banker' || currentInteractionType === 'IPA Trustee' || currentInteractionType === 'Auditor'
        ? Yup.object().shape({
            label: Yup.string().required(),
            value: Yup.string().required(),
          })
        : Yup.object().shape({
            label: Yup.string().nullable(),
            value: Yup.string().nullable(),
          }),
    selectedMeetingType:
      currentInteractionType !== 'Plant Visit'
        ? Yup.object().shape({
            label: Yup.string().required(),
            value: Yup.string().required(),
          })
        : Yup.object()
            .shape({
              label: Yup.string().nullable(),
              value: Yup.string().nullable(),
            })
            .notRequired(),
    interactionTime: currentInteractionType !== 'Plant Visit' ? Yup.string().nullable() : null,
    placeOfVisit: currentInteractionType === 'Plant Visit' ? Yup.string().required() : null,
    document: Yup.string(),
  })
}

const getCreateMinutesValidations = () => {
  return Yup.object().shape({
    discussionParagraph: Yup.string().required(),
    commentsParagraph: Yup.string().required(),
  })
}

const getDiligenceValidations = () => {
  return Yup.object().shape({})
}

const getRatingMasterValidationSchema = (masterType) => {
  switch (masterType) {
    case 'Rating Symbol Master':
      return Yup.object().shape({
        ratingSymbol: Yup.string().required('Rating Symbol is required'),
        ratingScale: Yup.object().shape({
          label: Yup.string().required('Is Required'),
          value: Yup.string().required('Rating Symbol is required'),
        }),
        description: Yup.string(),
        grade: Yup.string().required().required('Grade is required'),
        weightage: Yup.number().min(0, 'Weightage cannot be negative').required('Weightage is required'),
        is_active: Yup.boolean(),
      })
    case 'Rating Symbol Category':
      return Yup.object().shape({
        symbolTypeCategory: Yup.string().required('Symbol type is required'),
        is_active: Yup.boolean(),
      })
    case 'Rating Symbol Mapping':
      return Yup.object().shape({
        prefix: Yup.string(),
        suffix: Yup.string(),
        ratingSymbolMaster: Yup.object().shape({
          label: Yup.string().required('Is Required'),
          value: Yup.string().required('Rating Symbol Master is required'),
        }),
        ratingSymbolCategory: Yup.object().shape({
          label: Yup.string().required('Is Required'),
          value: Yup.string().required('Rating Symbol Category is required'),
        }),
        is_active: Yup.bool(),
      })
  }
}

export {
  getUserSchema,
  getCompanyOnboardingSchema,
  getSubsidiarySchema,
  getMandateSchema,
  getDueDiligenceAddSchema,
  getDiligenceValidations,
  getRatingMasterValidationSchema,
  getCreateMinutesValidations,
}

// import { object, string, mixed } from "yup"

// const schema = object().shape({
//   pan_card_file: mixed().test("fileSize", "The file is too large", (value) => {
//     if (!value.length) return true // attachment is optional
//     return value[0].size <= 2000000
//   }),
// })
