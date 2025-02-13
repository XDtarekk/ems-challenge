import { useLoaderData, useNavigate } from "react-router";
import { useState } from "react";
import { getDB } from "~/db/getDB";

import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
 
import '@schedule-x/theme-default/dist/index.css'

export async function loader({ request }: { request: Request }) {
  const db = await getDB();
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const employee = url.searchParams.get("employee") || "";
  const employeeSearch = employee ? `AND employees.id = ?` : "";

  const query = `
    SELECT 
      timesheets.id,  
      timesheets.summary,
      strftime('%Y-%m-%d', timesheets.start_time) AS start_time, 
      strftime('%Y-%m-%d', timesheets.end_time) AS end_time, 
      employees.full_name, 
      employees.id AS employee_id 
    FROM timesheets 
    JOIN employees ON timesheets.employee_id = employees.id
    WHERE employees.full_name LIKE ? 
    ${employeeSearch};
  `;
  
  const params = [`%${search}%`];
  if (employee) params.push(employee);
  
  const timesheetsAndEmployees = await db.all(query, params);

  const timesheetsEmployees = await db.all(
    "SELECT DISTINCT employees.full_name, employees.id AS employee_id FROM timesheets JOIN employees ON timesheets.employee_id = employees.id"
  );
  return { timesheetsAndEmployees, employee, search ,timesheetsEmployees};
}

export default function TimesheetsPage() {
  const { timesheetsAndEmployees , employee, search,timesheetsEmployees} = useLoaderData();
  const navigate = useNavigate()
  // const observerRef = useRef(null)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    navigate(`?search=${searchValue}&employee=${employee?employee:""}`);
  };
  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filterValue = e.target.value;
    navigate(`?search=${search?search:""}&employee=${filterValue}`);
  };

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    events: timesheetsAndEmployees.map((timesheet: any) => ({
      id: timesheet.id,
      title: timesheet.full_name,
      start: timesheet.start_time,
      end: timesheet.end_time,
    })),
    plugins: [timesheetsAndEmployees]
  })
  const [view, setView] = useState('ListView')
  return (
    <div>
      <div>
        <button onClick={() => setView('ListView')} className={view == "ListView" ? "chosenView" : undefined}>Table View</button>
        <button onClick={() => setView('calendarView')} className={view !== "ListView" ? "chosenView" : undefined}>Calendar View</button>
      </div>
      <input defaultValue={search} onChange={handleSearch} type="text" placeholder="Search Timesheets" style={{width:"100%"}}/>
      <select onChange={handleFilter} name="employee" id="employee">
        <option value="">Select Employee</option>
        {timesheetsEmployees.map((timesheet: { employee_id: number; full_name: string }) => (
          <option key={timesheet.employee_id} value={timesheet.employee_id}>
            {timesheet.full_name}
          </option>
        ))}
      </select>
      {/* Replace `true` by a variable that is changed when the view buttons are clicked */}
      {view === 'ListView' ? (
        <div>
          {timesheetsAndEmployees.map((timesheet: any) => (
            <div key={timesheet.id}>
              <ul>
                <li>Timesheet #{timesheet.id}</li>
                <ul>
                  <li>Employee: {timesheet?.full_name} (ID: {timesheet.employee_id})</li>
                  {timesheet?.summary &&
                  <li>Summary: {timesheet?.summary}</li>
                  }
                  <li>Start Time: {timesheet?.start_time}</li>
                  <li>End Time: {timesheet?.end_time}</li>
                  <a href={`/timesheets/${timesheet.id}`}>View Timesheet</a>
                </ul>
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <ScheduleXCalendar calendarApp={calendar} />
        </div>
      )}
      <hr />
      <ul>
        <li><a href="/timesheets/new">New Timesheet</a></li>
        <li><a href="/employees">Employees</a></li>
      </ul>
    </div>
  );
}
