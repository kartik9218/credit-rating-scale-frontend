import moment from "moment"

export function SET_PAGE_TITLE(title) {
  const pageTitle = `Infomerics 4i Concept System`
  return (document.title = `${title} - ${pageTitle}`)
}

export function SET_DATA(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  return true
}

export function GET_DATA(key) {
  var value = localStorage.getItem(key)
  var jsonValue = null
  try {
    jsonValue = JSON.parse(value)
  } catch (err) {
    jsonValue = null
  }
  return jsonValue
}

export function REMOVE_DATA(key) {
  localStorage.removeItem(key)
  return true
}
export function FORMATE_DATE(key) {
  return key ? moment(key).format("DD/MM/YYYY") : "-"
}
export function INPUT_DATE_FORMATE(key) {
  return key ? moment(key).format("YYYY-MM-DD") : null
}
export function FORMATE_USER_NAME(obj) {
  return obj?.full_name ? obj?.full_name + ' (' + obj?.employee_code + ')' : "";
}

export function DESTROY_DATA() {
  let keys = ['user', 'active_role']
  keys.forEach((key) => {
    REMOVE_DATA(key)
  })
  return true
}

export function FORMATE_NUMBER(numberData = 0) {
  numberData = parseFloat(numberData);
  if (!numberData || numberData === null || typeof numberData !== 'number' || isNaN(numberData)) {
    return 0
  }
  if (numberData && numberData.isInteger) {
    return parseInt(numberData)
  } else {
    return parseFloat(numberData.toFixed(2))
  }
}

export function CHECK_IF_OBJECT_EMPTY(obj) {
  if (obj && Object.keys(obj).length === 0) {
    return null
  } else {
    return obj
  }
}

export function GET_USER_PROPS(key, parent = 'user') {
  const user = GET_DATA(parent)
  return user && user[key] ? user[key] : null
}

export function HAS_PERMISSIONS(permissions) {
  var navigations_path = GET_USER_PROPS('navigations_path', 'active_role')
  return permissions.every((el) => navigations_path.includes(el))
}

export function GET_USER_TYPE(type) {
  let text = type

  switch (type) {
    case 'BUSINESS_DEVELOPER':
      text = 'Business Developer'
      break

    case 'RATING_ANALYST':
      text = 'Rating Analyst'
      break

    case 'SUPER_ADMIN':
      text = 'Super Admin'
      break

    case 'GROUP_HEAD':
      text = 'Group Head'
      break

    default:
      break
  }

  return text
}

export function GENERATE_UUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function GET_ROUTE_NAME(ctx, params, setNonce = false) {
  let path = `/`
  switch (ctx) {
    case 'DASHBOARD':
      path = `/dashboard`
      break

    case 'DASHBOARD_FOR_COMPANY':
      path = `/dashboard/companies/view?uuid=${params['uuid']}`
      break
    case 'ADD_COMPANY':
      path = '/dashboard/company/create'
      break
    case 'VIEW_COMPANY':
      path = `/dashboard/companies/view?uuid=${params['uuid']}`
      break

    case 'EDIT_COMPANY':
      path = `/dashboard/company/edit?uuid=${params['uuid']}`
      break

    case 'ADD_SUBSIDIARY':
      path =
        params === null
          ? `/dashboard/company/subsidiary/create`
          : `/dashboard/company/subsidiary/create?uuid=${params['uuid']}&parent-company=${params['parentCompany']}`
      break

    case 'EDIT_SUBSIDIARY':
      path = `/dashboard/company/subsidiary/edit?uuid=${params['uuid']}&parent-company=${params['parentCompany']}`
      break

    case 'INBOX':
      path = `/dashboard/inbox`
      break

    case 'EXECUTE':
      path = `/dashboard/execute?activity-code=${params['activityCode']}&uuid=${params['companyUuid']}&rating-uuid=${params['ratingUuid']}`
      break

    case 'DEFAULT_BD_VIEW':
      path = `/dashboard/companies`
      break

    case 'DEFAULT_SUPER_ADMIN_VIEW':
      path = `/dashboard`
      break

    case 'LIST_ROLES':
      path = `/dashboard/roles`
      break

    case 'ADD_ROLE':
      path = `/dashboard/roles/create`
      break

    case 'EDIT_ROLE':
      path = `/dashboard/roles/edit?uuid=${params['uuid']}`
      break

    case 'LIST_CONFIGURATOR':
      path = `/dashboard/rating-modules/configurators`
      break

    case 'ADD_CONFIGURATOR':
      path = `/dashboard/rating-modules/configurators/create`
      break

    case 'EDIT_CONFIGURATOR':
      path = `/dashboard/rating-modules/configurators/edit?uuid=${params['uuid']}`
      break
    case 'EDIT_MODEL_MAPPED_INDUSTRIES':
      path = `/dashboard/rating-modules/model-mapping/industry-mapping/edit?uuid=${params['uuid']}`
      break

    case 'LIST_INDUSTRIES':
      path = `/dashboard/company/master/industries`
      break

    case 'ADD_INDUSTRIES':
      path = `/dashboard/company/master/industries/create`
      break

    case 'EDIT_INDUSTRIES':
      path = `/dashboard/company/master/industries/edit?uuid=${params['uuid']}`
      break

    case 'LIST_SECTORS':
      path = `/dashboard/company/master/sectors`
      break

    case 'ADD_SECTOR':
      path = `/dashboard/company/master/sectors/create`
      break

    case 'EDIT_SECTOR':
      path = `/dashboard/company/master/sectors/edit?uuid=${params['uuid']}`
      break

    case 'LIST_USER':
      path = `/dashboard/users`
      break

    case 'ADD_USER':
      path = `/dashboard/users/create`
      break

    case 'VIEW_USER':
      path = `/dashboard/users/view?uuid=${params['uuid']}`
      break

    case 'EDIT_USER':
      path = `/dashboard/users/edit?uuid=${params['uuid']}`
      break

    case 'LIST_NAVIGATION':
      path = `/dashboard/navigations`
      break

    case 'ADD_NAVIGATION':
      path = `/dashboard/navigations/create`
      break

    case 'EDIT_NAVIGATION':
      path = `/dashboard/navigations/edit?uuid=${params['uuid']}`
      break

    case 'LIST_PERMISSION':
      path = `/dashboard/permissions`
      break

    case 'ADD_PERMISSION':
      path = `/dashboard/permissions/create`
      break

    case 'EDIT_PERMISSION':
      path = `/dashboard/permissions/edit?uuid=${params['uuid']}`
      break

    case 'LIST_MANDATE':
      path = (params['company_uuid'] !== undefined && params['company_uuid']) ? `/dashboard/company/mandate?company-uuid=${params['company_uuid']}` : "/dashboard/company/mandate"
      break
    case 'ADD_MANDATE':
      path = (params['company_uuid'] !== undefined && params['company_uuid']) ? `/dashboard/company/mandate/create?company-uuid=${params['company_uuid']}` : "/dashboard/company/mandate/create"
      break
    case 'VIEW_MANDATE':
      path = `/dashboard/company/mandate/view?uuid=${params['uuid']}&company-uuid=${params['company_uuid']}`
      break

    case 'EDIT_MANDATE':
      path = `/dashboard/company/mandate/edit?uuid=${params['uuid']}&company-uuid=${params['company_uuid']}`
      break

    case 'LIST_COMPANY_MASTER':
      path = `/dashboard/company/masters`
      break

    case 'LIST_MASTER':
      path = `/dashboard/settings/masters`
      break

    case 'MASTER_CREATE':
      path = `/dashboard/settings/masters/create`
      break

    case 'MASTER_EDIT':
      path = `/dashboard/settings/masters/edit?slug=${params['slug']}`
      break

    case 'LIST_INSTRUMENTS':
      path = params['company_uuid'] !== undefined && params['company_uuid'] ? `/dashboard/company/instruments?company-uuid=${params['company_uuid']}` : `/dashboard/company/instruments`
      break

    case 'ADD_INSTRUMENT_CREATE':
      path = `/dashboard/company/instruments/create?uuid=${params['uuid']}&company-uuid=${params['company_uuid']}`
      break

    case 'BANK_LENDER_MANAGE':
      path = `/dashboard/company/bank_manage?uuid=${params['uuid']}&company-uuid=${params['company_uuid']}`;
      break;

    case 'ADD_WORKFLOW':
      path = `/dashboard/workflow-management/workflow/create`
      break
    case 'VIEW_WORKFLOW':
      path = `/dashboard/workflow-management/workflow/view?uuid=${params['uuid']}`
      break
    case 'EDIT_WORKFLOW':
      path = `/dashboard/workflow-management/workflow/edit?uuid=${params['uuid']}`
      break
    case 'VIEW_ACTIVITY':
      path = `/dashboard/workflow-management/activity/view?uuid=${params['uuid']}`
      break
    case 'EDIT_ACTIVITY':
      path = `/dashboard/workflow-management/activity/view?uuid=${params['uuid']}`
      break

    case 'ADD_ACTIVITY':
      path = `/dashboard/workflow-management/activity/create`
      break

    case 'EDIT_CATEGORIES':
      path = `/dashboard/company/master/categories/edit?uuid=${params['uuid']}`
      break

    case 'ADD_CATEGORIES':
      path = `/dashboard/company/master/categories/create`
      break

    case 'LIST_CATEGORIES':
      path = `/dashboard/company/master/categories`
      break

    case 'EDIT_RATING_PROCESS':
      path = `/dashboard/company/master/rating-process/edit?uuid=${params['uuid']}`
      break

    case 'ADD_RATING_PROCESS':
      path = `/dashboard/company/master/rating-process/create`
      break

    case 'LIST_RATING_PROCESS':
      path = `/dashboard/company/master/rating-process`
      break

    case 'EDIT_FINANCIAL_YEAR':
      path = `/dashboard/company/master/financial-year/edit?uuid=${params['uuid']}`
      break

    case 'ADD_FINANCIAL_YEAR':
      path = `/dashboard/company/master/financial-year/create`
      break

    case 'LIST_FINANCIAL_YEAR':
      path = `/dashboard/company/master/financial-year`
      break

    case 'LIST_SUBCATEGORIES':
      path = `/dashboard/company/master/sub_categories`
      break

    case 'EDIT_SUBCATEGORIES':
      path = `/dashboard/company/master/sub_categories/edit?uuid=${params['uuid']}`
      break

    case 'ADD_SUBCATEGORIES':
      path = `/dashboard/company/master/sub_categories/create`
      break

    case 'LIST_SUBINDUSTRIES':
      path = `/dashboard/company/master/sub_industries`
      break

    case 'EDIT_SUBINDUSTRIES':
      path = `/dashboard/company/master/sub_industries/edit?uuid=${params['uuid']}`
      break

    case 'ADD_SUBINDUSTRIES':
      path = `/dashboard/company/master/sub_industries/create`
      break

    case 'LIST_CITY':
      path = `/dashboard/company/master/cities`
      break

    case 'EDIT_CITY':
      path = `/dashboard/company/master/cities/edit?uuid=${params['uuid']}`
      break

    case 'ADD_CITY':
      path = `/dashboard/company/master/cities/create`
      break

    case 'LIST_STATE':
      path = `/dashboard/company/master/states`
      break

    case 'EDIT_STATE':
      path = `/dashboard/company/master/states/edit?uuid=${params['uuid']}`
      break

    case 'ADD_STATE':
      path = `/dashboard/company/master/states/create`
      break

    case 'LIST_COUNTRY':
      path = `/dashboard/company/master/countries`
      break

    case 'EDIT_COUNTRY':
      path = `/dashboard/company/master/countries/edit?uuid=${params['uuid']}`
      break

    case 'ADD_COUNTRY':
      path = `/dashboard/company/master/countries/create`
      break

    case 'LIST_MACRO_ECONOMIC_INDICATOR':
      path = `/dashboard/company/master/macro_economic_indicator`
      break

    case 'EDIT_MACRO_ECONOMIC_INDICATOR':
      path = `/dashboard/company/master/macro_economic_indicator/edit?uuid=${params['uuid']}`
      break

    case 'ADD_MACRO_ECONOMIC_INDICATOR':
      path = `/dashboard/company/master/macro_economic_indicator/create`
      break
    case 'EDIT_NOTCHING_MODEL':
      path = `/dashboard/company/master/notching-model/edit?uuid=${params['uuid']}`
      break

    case 'ADD_NOTCHING_MODEL':
      path = `/dashboard/company/master/notching-model/create`
      break

    case 'LIST_NOTCHING_MODEL':
      path = `/dashboard/company/master/notching-models`
      break
    case 'VIEW_NOTCHING_MODEL':
      path = `/dashboard/company/master/notching-model/view?uuid=${params['uuid']}`
      break

    case 'LIST_DEPARTMENT':
      path = `/dashboard/company/master/departments`
      break

    case 'EDIT_DEPARTMENT':
      path = `/dashboard/company/master/departments/edit?uuid=${params['uuid']}`
      break

    case 'ADD_DEPARTMENT':
      path = `/dashboard/company/master/departments/create`
      break

    case 'LIST_RISKTYPE':
      path = `/dashboard/company/master/risk_type`
      break

    case 'EDIT_RISKTYPE':
      path = `/dashboard/company/master/risk_type/edit?uuid=${params['uuid']}`
      break

    case 'ADD_RISKTYPE':
      path = `/dashboard/company/master/risk_type/create`
      break

    case 'LIST_INSTRUMENT':
      path = `/dashboard/company/master/instruments`
      break

    case 'EDIT_INSTRUMENT':
      path = `/dashboard/company/master/instruments/edit?uuid=${params['uuid']}`
      break

    case 'ADD_INSTRUMENT':
      path = `/dashboard/company/master/instruments/create`
      break

    case 'LIST_BRANCHOFFICE':
      path = `/dashboard/company/master/branch-offices`
      break

    case 'EDIT_BRANCHOFFICE':
      path = `/dashboard/company/master/branch-offices/edit?uuid=${params['uuid']}`
      break

    case 'ADD_BRANCHOFFICE':
      path = `/dashboard/company/master/branch-offices/create`
      break

    case 'ADD_DILIGENCE':
      path = `/dashboard/due-diligence/create`
      break
    case 'VIEW_DILIGENCE':
      path = `/dashboard/due-diligence?operation=${params['operation']}&uuid=${params['uuid']}`
      break
    case 'EDIT_DILIGENCE':
      path = `/dashboard/due-diligence?operation=${params['operation']}&uuid=${params['uuid']}`
      break
    case 'LIST_DILIGENCE':
      path = `/dashboard/due-diligence/history`
      break

    case 'LIST_RATING_MODEL':
      path = `/dashboard/rating-modules/rating-model-list`
      break

    case 'INITIATE_RATING_MODEL':
      path = `/dashboard/rating-modules/initiate-rating-model`
      break
    case 'ADD_MODEL_MAP':
      path = `/dashboard/rating-modules/add-model-map`
      break
    case 'LIST_MODEL_MAPPING':
      path = `/dashboard/rating-modules/model-mapping`
      break

    case 'RATING_MODEL_INPUT':
      path = `/dashboard/rating-modules/rating-input?uuid=${params['uuid']}&model-uuid=${params['modelUuid']}`
      break

    case 'LIST_INTERACTION_TYPE':
      path = `/dashboard/company/master/interaction-types`
      break

    case 'ADD_INTERACTION_TYPE':
      path = `/dashboard/company/master/interaction-types/create`
      break

    case 'EDIT_INTERACTION_TYPE':
      path = `/dashboard/company/master/interaction-types/edit?uuid=${params['uuid']}`
      break
    case 'LIST_INTERACTION_QUESTION':
      path = `/dashboard/company/master/interaction-questions`
      break

    case 'ADD_INTERACTION_QUESTION':
      path = `/dashboard/company/master/interaction-question/create?interaction_uuid=${params['intUUID']}`
      break

    case 'EDIT_INTERACTION_QUESTION':
      path = `/dashboard/company/master/interaction-question/edit?uuid=${params['uuid']}`
      break

    case 'LIST_RATING_COMMITTEE_CATEGORIES':
      path = `/dashboard/company/master/rating-committee-categories`
      break

    case 'ADD_RATING_COMMITTEE_CATEGORIES':
      path = `/dashboard/company/master/rating-committee-categories/create`
      break

    case 'EDIT_RATING_COMMITTEE_CATEGORIES':
      path = `/dashboard/company/master/rating-committee-categories/edit?uuid=${params['uuid']}`
      break
    case 'LIST_RATING_COMMITTEE_TYPES':
      path = `/dashboard/company/master/rating-committee-types`
      break

    case 'ADD_RATING_COMMITTEE_TYPES':
      path = `/dashboard/company/master/rating-committee-types/create`
      break

    case 'EDIT_RATING_COMMITTEE_TYPES':
      path = `/dashboard/company/master/rating-committee-types/edit?uuid=${params['uuid']}`
      break

    case 'VIEW COMMITTEE MEETING MEMBERS':
      path = `/dashboard/rating-committee/meetings/committee-member?uuid=${params['uuid']}`
      break
    case 'VIEW_COMMITTEE_AGENDA':
      path = `/dashboard/rating-committee/meetings/view-agenda?uuid=${params['uuid']}`
      break
    case 'LIST_COMMITTEE_AGENDA':
      path = `/dashboard/rating-committee/committee-agenda?uuid=${params['uuid']}`
      break
    case 'VIEW COMMITTEE MINUTES':
      path = `/dashboard/rating-committee/meetings/view-committee-minutes?uuid=${params['uuid']}`
      break

    case 'VIEW COMMITTEE VOTING':
      path = `/dashboard/rating-committee/meetings/committee-voting?uuid=${params['uuid']}`
      break

    case 'VIEW COMMITTEE RATING REGISTER':
      path = `/dashboard/rating-committee/meetings/rating-register?uuid=${params['uuid']}`
      break

    case 'ADD_TEMPLATE':
      path = `/dashboard/rating-letter/template-list/create`
      break

    case 'LETTER_CONFIGURATOR':
      path = `/dashboard/rating-letter/letter-configurator`
      break

    case 'RATING_SYMBOL_LISTING':
      path = `/dashboard/company/master/rating-symbol`
      break

    case 'RATING_SYMBOL_CREATE':
      path = `/dashboard/company/master/rating-symbol/create`
      break

    case 'EDIT_RATING_SYMBOL':
      path = `/dashboard/company/master/rating-symbol/edit?uuid=${params['uuid']}&rating-type=${params['type']}`
      break
    case 'SEND_TO_COMMITTEE':
      path =
        params === null
          ? `/dashboard/rating-committee/send-to-committee`
          : `/dashboard/rating-committee/send-to-committee?company-uuid=${params['company_uuid']}&code=${params['code']}&rating-uuid=${params['ratingUuid']}`
      break
    case 'LIST_RATING_VERIFICATION':
      path =
        params === null
          ? `/dashboard/rating-committee/rating-verification`
          : `/dashboard/rating-committee/rating-verification?company-uuid=${params['company_uuid']}&code=${params['code']}&rating-uuid=${params['ratingUuid']}`
      break

    default:
      break
  }

  if (setNonce) {
    path = path.concat(`#nonce=${Date.now()}`)
  }

  return encodeURI(path)
}

export function GET_QUERY(key) {
  const searchParams = new URLSearchParams(document.location.search)
  return searchParams.get(key)
}

export const DEBOUNCE = (callback, delay) => {
  let timer;
  return function (...args) {
    let _this = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      callback.apply(_this, args);
    }, delay);
  };
};