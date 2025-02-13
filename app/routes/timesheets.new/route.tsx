import { useLoaderData, Form, redirect, useActionData } from "react-router";
import { getDB } from "~/db/getDB";

export async function loader() {
  const db = await getDB();
  const employees = await db.all('SELECT id, full_name FROM employees');
  return { employees };
}

import type { ActionFunction } from "react-router";
import { useEffect } from "react";

export const action: ActionFunction = async ({ request }) => {
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
    'INSERT INTO timesheets (employee_id, start_time, end_time, summary) VALUES (?, ?, ?, ?)',
    [employee_id, start_time, end_time, summry]
  );

  return redirect("/timesheets");
}

export default function NewTimesheetPage() {
  const { employees } = useLoaderData();
  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.errors) {
      alert(actionData.errors.join("\n"));
    }
  }, [actionData]);
  return (
    <div>
      <h1>Create New Timesheet</h1>
      <Form method="post">
        <div>
        <select name="employee_id" id="employee_id" required>
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
          <input type="datetime-local" name="start_time" id="start_time" required />
        </div>
        <div>
          <label htmlFor="end_time">End Time</label>
          <input type="datetime-local" name="end_time" id="end_time" required />
        </div>
        <div>
          <label htmlFor="summary">Summary</label>
          <textarea name="summary" id="summary" required />
        </div>
        <button type="submit">Create Timesheet</button>
      </Form>
      <hr />
      <ul>
        <li><a href="/timesheets">Timesheets</a></li>
        <li><a href="/employees">Employees</a></li>
      </ul>
    </div>
  );
}
