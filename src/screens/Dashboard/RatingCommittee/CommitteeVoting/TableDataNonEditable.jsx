import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { GET_QUERY } from 'helpers/Base'

function TableDataNonEditable({ row, columns, ClickedMember }) {
  const committeeMeetingUUID = GET_QUERY('uuid')
  const [MembersInsVotes, setMembersInsVotes] = useState([])
  const [SelectedMembersInsVotes, setSelectedMembersInsVotes] = useState({})

  const getVotingData = () => {
    HTTP_CLIENT(APIFY('/v1/chairman/view_votes'), {
      params: {
        rating_committee_meeting_uuid: committeeMeetingUUID,
        instrument_detail_uuid: row.instrument_detail_uuid,
      },
    })
      .then((data) => {
        if (data['success']) {
          const { rating_committee_voting } = data

          setMembersInsVotes(rating_committee_voting)
        }
      })
      .catch((err) => {})
  }
  useEffect(() => {
    getVotingData()
  }, [])
  useEffect(() => {
    console.log(MembersInsVotes)
    let obj = MembersInsVotes.find((val) => val.member.uuid === ClickedMember?.uuid)

    if (obj === undefined) {
      obj = {}
      obj['dissent_remarks'] = ''
      obj['dissent'] = ''
      obj['voted_rating'] = ''
      obj['remarks'] = ''
    }

    setSelectedMembersInsVotes({
      instrument: row['instrument'],
      value: row['value'].toFixed(2),
      proposedrating: row['proposedrating'],
      dissentremark: obj['dissent_remark'] ? obj['dissent_remark']:'-',
      dissent: obj['dissent'] ? obj['dissent'] : '-',
      vote: obj['voted_rating'],
      remarks: obj['remarks'] ? obj['remarks'] : '--',
    })
  }, [ClickedMember, MembersInsVotes])

  return (
    <div style={{ display: 'flex', background: 'white', border: '1px solid #eee', padding: '8px' }}>
      {columns.map((value, idx) => {
        value = value.toLowerCase()
        if (value.split(' ')[0] == 'value') value = value.split(' ')[0]
        value = value.replace(' ', '')

        return (
          <div key={idx + value} style={{ flex: '1' }}>
            {SelectedMembersInsVotes[value] === undefined ? '' : SelectedMembersInsVotes[value] + ''}
          </div>
        )
      })}
    </div>
  )
}
TableDataNonEditable.propTypes = {
  row: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  ClickedMember: PropTypes.object,
}
export default TableDataNonEditable
