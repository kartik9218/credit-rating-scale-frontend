import { useEffect, useState, useRef } from "react";
import { Grid, Tabs, Tab } from "@mui/material";
import { SET_PAGE_TITLE, GET_QUERY } from "helpers/Base";
import { ArgonBox } from "components/ArgonTheme";
import ArgonButton from "components/ArgonButton";
import {
  ListingDetail,
  BasicDetail,
  AddressDetail,
  DirectorDetail,
  KeyDetail,
  ShareholderPattern,
  StakeholderDetails,
} from "./CompanyDetail";
import { onboardingSteps } from "helpers/constants";
import { HTTP_CLIENT, APIFY } from "helpers/Api";
import { DashboardLayout } from "layouts";
import { ArrowBackRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CardWrapper from "slots/Cards/CardWrapper";

const CompanyOnboarding = () => {
  const legalStatusOptions = useRef([]);
  const [activeTab, setActiveTab] = useState(0);
  const [groupOptions, setGroupOptions] = useState([]);
  const [companyTypeOptions, setCompanyTypeOptions] = useState([]);
  const [tagsOptions, setTagsOptions] = useState([]);
  const [addressTypeOptions, setAddressTypeOptions] = useState([]);
  const [parentCompanyOptions, setParentCompanyOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [stakeholderOptions, setStakeholderOptions] = useState([]);
  const [countryOptions, setCountryOptions] = useState([]);
  const [listingStatusOptions, setListingStatusOptions] = useState([]);
  const [macroEconomicOptions, setMacroEconomicOptions] = useState([]);
  const [holdingTypeOptions, setHoldingTypeOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);
  const [companyUuid, setCompanyUuid] = useState("");
  const [exchangeNameOpitons, setExchangeNameOptions] = useState([]);
  const [companyName, setCompanyName] = useState("Company Update");
  const navigate = useNavigate();
  const requests = [
    "stakeholder_type",
    "exchange",
    "legal_status",
    "group",
    "company_type",
    "address_type",
    "designation",
    "listing_status",
    "stakeholder_type",
    "holding_type",
    "gender",
  ];
  useEffect(() => {
    GET_QUERY("uuid") ? SET_PAGE_TITLE("Edit Company") : SET_PAGE_TITLE("Add New Company");
  }, []);

  useEffect(() => {
    requests.forEach((reqest) => getMasters(reqest));
    getTagsOptions();
    getParentCompanies();
    getDepartments();
    getCountries();
    getMacroEconomicIndicator();
  }, []);

  const getMasters = (groupType) => {
    HTTP_CLIENT(APIFY("/v1/master"), { group: groupType })
      .then((data) => {
        const { masters } = data;
        const options = [];
        masters.forEach((master) => {
          const { name, value, uuid } = master;
          if (groupType === "stakeholder_type") {
            options.push(Object.assign({}, master));
          } else options.push(Object.assign({}, { name, value, uuid }));
        });
        if (groupType === "legal_status") {
          legalStatusOptions.current = [...options];
        } else if (groupType === "address_type") {
          setAddressTypeOptions([...options]);
        } else if (groupType === "designation") {
          setDesignationOptions([...options]);
        } else if (groupType === "stakeholder_type") {
          setStakeholderOptions([...options]);
        } else if (groupType === "listing_status") {
          setListingStatusOptions([...options]);
        } else if (groupType === "group") {
          setGroupOptions([...options]);
        } else if (groupType === "company_type") {
          setCompanyTypeOptions([...options]);
        } else if (groupType === "holding_type") {
          setHoldingTypeOptions([...options]);
        } else if (groupType === "gender") {
          setGenderOptions([...options]);
        } else if (groupType === "exchange") {
          setExchangeNameOptions([...options]);
        }
      })
      .catch((err) => console.log(err));
  };

  const getDepartments = () => {
    HTTP_CLIENT(APIFY("/v1/departments"), {params:{is_active:true}}).then((data) => {
      const department = data["departments"].map((role) => {
        return {
          label: role["name"],
          value: role["uuid"],
        };
      });
      setDepartmentOptions(department);
    });
  };

  const getCountries = () => {
    HTTP_CLIENT(APIFY("/v1/countries"), {params:""}).then((data) => {
      const { countries } = data;
      setCountryOptions([...countries]);
    });
  };

  const getMacroEconomicIndicator = () => {
    HTTP_CLIENT(APIFY("/v1/macro_economic_indicators"),{params:{is_active:true}})
      .then((data) => {
        const { macro_economic_indicators } = data;
        const options = [];
        macro_economic_indicators.forEach(({ name, uuid }) => {
          options.push(Object.assign({}, { label: name, value: uuid }));
        });
        setMacroEconomicOptions([...options]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getParentCompanies = () => {
    HTTP_CLIENT(APIFY("/v1/companies?type=subsidiary"))
      .then((data) => {
        const { companies } = data;
        const options = [];
        companies.forEach(({ uuid, name, sector }) => {
          options.push(Object.assign({}, { uuid, name, sector }));
        });
        setParentCompanyOptions([...options]);
      })
      .catch((err) => console.error(err));
  };

  const getTagsOptions = () => {
    HTTP_CLIENT(APIFY("/v1/tags"))
      .then((data) => {
        const { tags } = data;
        const options = [];
        tags.forEach(({ name, uuid }) => {
          options.push(Object.assign({}, { uuid, name }));
        });
        setTagsOptions([...options]);
      })
      .catch((err) => console.error(err));
  };

  const handleChangeActiveTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSetCompanyUuid = (uuid) => setCompanyUuid(uuid);
  const handleSetCompanyName = (name) => setCompanyName(name);

  const getActiveComponent = () => {
    switch (activeTab) {
      case 0:
        return (
          <BasicDetail
            groupOptions={groupOptions}
            legalStatusOptions={legalStatusOptions}
            macroEconomicOptions={macroEconomicOptions}
            companyTypeOptions={companyTypeOptions}
            parentCompanyOptions={parentCompanyOptions}
            tagsOptions={tagsOptions}
            handleSetCompanyUuid={handleSetCompanyUuid}
            handleSetCompanyName={handleSetCompanyName}
            handleChangeActiveTab={handleChangeActiveTab}
          />
        );
      case 1:
        return (
          <AddressDetail
            countryOptions={countryOptions}
            addressTypeOptions={addressTypeOptions}
            companyUuid={companyUuid}
          />
        );
      case 2:
        return (
          <KeyDetail
            designationOptions={designationOptions}
            departmentOptions={departmentOptions}
            companyUuid={companyUuid}
          />
        );
      case 3:
        return (
          <ListingDetail
            listingStatusOptions={listingStatusOptions}
            companyUuid={companyUuid}
            exchangeNameOpitons={exchangeNameOpitons}
          />
        );
      case 4:
        return <DirectorDetail companyUuid={companyUuid} />;
      case 5:
        return (
          <ShareholderPattern companyUuid={companyUuid} holdingTypeOptions={holdingTypeOptions} />
        );
      case 6:
        return (
          <StakeholderDetails
            companyUuid={companyUuid}
            stakeholderOptions={stakeholderOptions}
            departmentOptions={departmentOptions}
            designationOptions={designationOptions}
            countryOptions={countryOptions}
            genderOptions={genderOptions}
          />
        );
      default:
        return <BasicDetail />;
    }
  };

  return (
    <DashboardLayout>
      <CardWrapper
       headerTitle={GET_QUERY("uuid") ? `${companyName}` : "Add New Company"}
       headerActionButton={() => {
        return (
          <ArgonButton variant="contained" color="primary" onClick={() => navigate(-1)}>
          <ArrowBackRounded />
          Back to Companies
        </ArgonButton>
        )
       }}
       >
 
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <ArgonBox
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                position: "relative",
                zIndex: "20",
                background: "transparent",
                marginBottom: "40px",
              }}
            >
              <Tabs value={activeTab} onChange={handleChangeActiveTab}>
                {onboardingSteps.map(({ label, id }) => (
                  <Tab
                    key={id}
                    label={label}
                    className="tabs"
                    disabled={id > 0 && !GET_QUERY("uuid") ? true : id === 0 && false}
                  />
                ))}
              </Tabs>
            </ArgonBox>
            <ArgonBox
              sx={{
                marginTop: "-40px",
                overflowY: "scroll",
                height: "calc(100vh - 34vh)",
              }}
            >
              {getActiveComponent()}
            </ArgonBox>
          </Grid>
        </Grid>
      </CardWrapper>
    </DashboardLayout>
  );
};
export default CompanyOnboarding;
