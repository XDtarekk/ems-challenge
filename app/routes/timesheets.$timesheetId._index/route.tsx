import { useEffect } from "react";
import { useLoaderData, Form, redirect, useActionData, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader({ params }: { params: { timesheetId: string } }) {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees');
  const timesheet = await db.get(
    "SELECT * FROM timesheets WHERE id = ?;",
    [params.timesheetId]
  );
  return { employees ,timesheet};
}

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const employee_id = formData.get("employee_id");
  const summry = formData.get("summary");
  const start_time = formData.get("start_time");
  const end_time = formData.get("end_time");
  if (!start_time || !end_time || new Date(start_time.toString()) > new Date(end_time.toString())) {
    return { errors: ["Start time should be before end time"] };
  }

  const db = await getDB();
 
  await db.run(
    'UPDATE timesheets  SET employee_id = ?, start_time = ?, end_time = ?, summary = ? WHERE id = ?;',
    [employee_id, start_time, end_time, summry, params.timesheetId]
  );

  return redirect("/timesheets");
}

export default function TimesheetPage() {
  const { employees ,timesheet} = useLoaderData();
    const actionData = useActionData();
    useEffect(() => {
      if (actionData?.errors) {
        alert(actionData.errors.join("\n"));
      }
    }, [actionData]);
  return (
    <div>
      <Form method="post">
        <div>
        <select name="employee_id"  defaultValue={timesheet.employee_id} required>
            <option value="">Select Employee</option>
            {employees.map((employee: { id: number; full_name: string }) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="start_time">Start Time</label>
          <input type="datetime-local" name="start_time"  defaultValue={timesheet.start_time} required />
        </div>
        <div>
          <label htmlFor="end_time">End Time</label>
          <input type="datetime-local" name="end_time"  defaultValue={timesheet.end_time} required />
        </div>
        <div>
          <label htmlFor="summary">Summary</label>
          <textarea name="summary" id="summary" required defaultValue={timesheet.summary}/>
        </div>
        <button type="submit">Update Timesheet</button>
      </Form>
      <ul>
        <li><a href="/timesheets">Timesheets</a></li>
        <li><a href="/timesheets/new">New Timesheet</a></li>
        <li><a href="/employees/">Employees</a></li>
      </ul>
    </div>
  )
}
