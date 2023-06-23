import * as React from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PropTypes from 'prop-types'
import colors from 'assets/theme/base/colors'
import TableData from './TableData'
import TableDataNonEditable from './TableDataNonEditable'
import { Box } from '@mui/material'
import { useEffect } from 'react'
import { GET_DATA } from 'helpers/Base'
export default function ColumnHeader({
  columns,
  Editable,
  committee_registers,
  SelectedVotingData,
  ClickedMember,
  ClickedCompany,
}) {
  const AccordionHeadingStyle = { display: 'flex', width: '30%', justifyContent: 'space-around' }
  const AccordionTextStyle = { fontSize: '14px', color: colors.primary.main, fontWeight: 'bold' }
  const user = GET_DATA('user')

  return (
    <div>
      <Box
        style={{
          display: 'flex',
          width: '100%',
          height: 50,
          padding: '4px',
          alignItems: 'center',
          backgroundColor: 'aliceblue',
        }}
      >
        {columns.map((val, idx) => {
          return (
            <div style={{ flex: val == 'Vote' ? '3' : '2', fontWeight: 'bolder', textAlign: 'center' }} key={'row' + idx}>
              {val}
            </div>
          )
        })}
      </Box>
      <div style={{ overflowY: 'scroll', height: 200 }}>
        {Object.keys(committee_registers).map((key) => {
          return (
            <>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ flexDirection: 'row-reverse', backgroundColor: colors.light.main, overflowY: 'scroll' }}
                >
                  <div style={AccordionHeadingStyle}>
                    <Typography sx={{ ...AccordionTextStyle, color: colors.primary.main }}>Mandate ID:</Typography>
                    <Typography sx={{ ...AccordionTextStyle, color: colors.dark.main }}>{key}</Typography>
                  </div>
                  <div style={AccordionHeadingStyle}>
                    <Typography sx={{ ...AccordionTextStyle, color: colors.primary.main }}>Group Head:</Typography>
                    <Typography sx={{ ...AccordionTextStyle, color: colors.dark.main }}>
                      {committee_registers[key][0]['gh_name']}
                    </Typography>
                  </div>
                  <div style={AccordionHeadingStyle}>
                    <Typography sx={{ ...AccordionTextStyle, color: colors.primary.main }}>Rating Analyst:</Typography>
                    <Typography sx={{ ...AccordionTextStyle, color: colors.dark.main }}>
                      {committee_registers[key][0]['ra_name']}
                    </Typography>
                  </div>
                </AccordionSummary>

                <AccordionDetails>
                  {[...committee_registers[key]].map((val, idx) => {
                    return (
                      <>
                        {Editable ||
                        (ClickedMember?.is_chairman &&
                          ClickedMember?.uuid === user.uuid &&
                          ClickedCompany.voting_status === 'Live') ? (
                          <TableData
                            key={'row' + idx}
                            row={val}
                            columns={columns}
                            ClickedMember={ClickedMember}
                            committee_registers={committee_registers}
                            ClickedCompany={ClickedCompany}
                            index={key}
                            idx={idx}
                          />
                        ) : (
                          <TableDataNonEditable
                            key={'row' + idx}
                            row={val}
                            columns={columns}
                            ClickedMember={ClickedMember}
                          />
                        )}
                      </>
                    )
                  })}
                </AccordionDetails>
              </Accordion>
            </>
          )
        })}
      </div>
    </div>
  )
}
ColumnHeader.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  Editable: PropTypes.bool,
  committee_registers: PropTypes.arrayOf(PropTypes.object).isRequired,
  ClickedMember: PropTypes.object,
  SelectedVotingData: PropTypes.object,
  ClickedCompany: PropTypes.object,
}
