import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import './pdfTableStyle.css'
import { HTTP_CLIENT } from 'helpers/Api'
import { APIFY } from 'helpers/Api'
import { GET_QUERY } from 'helpers/Base'

const GeneratePDF = ({ data }) => {
  const [rows, setRows] = useState([])
  const pdfRef = useRef(null)

  const handleDownload = () => {
    let content = pdfRef.current
    let doc = new jsPDF()
    doc.html(content, {
      callback: function (doc) {
        doc.save('sample.pdf')
      },
      html2canvas: { scale: 0.157 },
    })
  }

  const fetchData = () => {
    HTTP_CLIENT(APIFY('/v1/committee_agenda/generate'), {
      params: {
        rating_committee_meeting_uuid: GET_QUERY('uuid'),
      },
    }).then()
  }
  useEffect(() => {
    if (data?.length > 0) {
      handleDownload()
    }
    fetchData()
  }, [data])
  return (
    <>
      <div ref={pdfRef} id="toolbar" style={{ width: '100%' }}>
        <p style={{ 'margin': 'auto', 'text-align': 'center' }}>
          <span
            style={{
              'font-size': '19pt',
              'font-family': 'Cambria, serif',
            }}
          ></span>
          <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>I</span>
          <span
            style={{
              'font-size': '14pt',
              'font-family': 'Cambria, serif',
              'marginRight': '1rem',
            }}
          >
            NFOMERICS
          </span>
          <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>V</span>
          <span
            style={{
              'font-size': '14pt',
              'font-family': 'Cambria, serif',
            }}
          >
            ALUATION{' '}
            <span
              style={{
                'font-size': '14pt',
                'font-family': 'Cambria, serif',
                'margin': '0 1rem',
              }}
            >
              AND
            </span>
          </span>
          <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>R</span>
          <span
            style={{
              'font-size': '14pt',
              'font-family': 'Cambria, serif',
              'marginRight': '1rem',
            }}
          >
            ATING
          </span>
          <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>P</span>
          <span
            style={{
              'font-size': '14pt',
              'font-family': 'Cambria, serif',
              'marginRight': '1rem',
            }}
          >
            RIVATE
          </span>
          <span style={{ 'font-size': '19pt', 'font-family': 'Cambria, serif' }}>L</span>
          <span
            style={{
              'font-size': '14pt',
              'font-family': 'Cambria, serif',
            }}
          >
            IMITED
          </span>
        </p>
        <p className="ql-align-center" style={{ 'text-align': 'center' }}>
          <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>
            Head Office-Flat No. 104/106/108, Golf Apartments, Sujan Singh Park,
          </span>
        </p>
        <p className="ql-align-center" style={{ 'text-align': 'center' }}>
          <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>&nbsp;New Delhi-110003,</span>
        </p>
        <p className="ql-align-center" style={{ 'text-align': 'center' }}>
          <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>Email:</span>
          <a
            rel="noreferrer"
            href="mailto:vma@infomerics.com"
            target="_blank"
            style={{
              'font-size': '12pt',
              'font-family': ' Cambria, serif',
              ' color': 'rgb(5, 99, 193)',
            }}
          >
            {' '}
            vma@infomerics.com
          </a>
          <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>, Website:</span>
          <span
            style={{
              'font-size': '12pt',
              'font-family': 'Cambria, serif',
              'color': 'rgb(5, 99, 193)',
            }}
          >
            {' '}
            www.infomerics.com
          </span>
        </p>
        <p className="ql-align-center" style={{ 'text-align': 'center' }}>
          <span style={{ 'font-size': '12pt', 'font-family': 'Cambria, serif' }}>
            Phone: +91-11 24601142, 24611910, Fax: +91 11 24627549
          </span>
        </p>
        <p className="ql-align-center" style={{ 'text-align': 'center' }}>
          <span style={{ 'font-size': '12pt', 'font-family': ' Cambria, serif' }}>(CIN: U32202DL1986PTC024575)</span>
        </p>
        <p className="ql-align-center">
          <br />
        </p>
        <p
          className="ql-align-center"
          style={{
            'text-align': 'center',
          }}
        >
          <u
            style={{
              'font-size': '12pt',
              'font-family': ' &quot,Times New Roman&quot',
            }}
          >
            AGENDA
          </u>
        </p>
        <p>
          <br />
        </p>
        <p className="ql-align-justify" style={{ margin: '-1rem 1rem -5rem 1rem' }}>
          <span
            style={{
              'font-size': '12pt',
              'font-family': '&quot,Times New Roman&quot',
            }}
          >
            Agenda for 91st Rating Committee Meeting (RCM) for the Financial Year 2022- 2023 of Infomerics Valuation and
            Rating Private Limited to be held on Monday, 06th March 2023 at 4:00 pm through video conference.
          </span>
        </p>
        <p className="ql-align-justify">
          <br />
        </p>
        <p className="ql-align-justify">
          <br />
        </p>
        <p className="ql-align-justify" style={{ margin: ' 3rem 1rem' }}>
          <span
            style={{
              'font-size': '12pt',
              'font-family': '&quot,Times New Roman&quot',
            }}
          >
            To confirm the minutes of the 89th Committee meeting held on 01st March 2023.
          </span>
        </p>
        <p className="ql-align-justify" style={{ margin: '1rem 1rem -2rem 1rem' }}>
          <span
            style={{
              'font-size': '12pt',
              'font-family': '&quot,Times New Roman&quot',
            }}
          >
            To consider following proposal for rating: -
          </span>
        </p>
        <p className="ql-align-justify">
          <br />
        </p>
        <p className="ql-align-justify">
          <br />
        </p>

        <table style={{ margin: '0 1rem' }}>
          <tr>
            <th>S. No.</th>
            <th>Name of the Entity</th>
            <th>Instrument / Facility</th>
            <th>Size (Rs. crore)</th>
            <th>Nature of Assignment</th>
          </tr>
          {data?.map((row) => {
            return (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.username}</td>
                <td>{row.email}</td>
                <td>{row.website}</td>
              </tr>
            )
          })}
        </table>
      </div>
    </>
  )
}

export default GeneratePDF

GeneratePDF.propTypes = {
  data: PropTypes.array,
}
