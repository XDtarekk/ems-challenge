import path from "path";
import { useEffect, useRef } from "react";
import { Form, useActionData, useLoaderData, useNavigate } from "react-router"
import { getDB } from "~/db/getDB"
import fs from "fs/promises";
import { type ActionFunction, redirect } from "react-router";
export async function loader({ params }: { params: { employeeId: string } }) {
  const db = await getDB();
  const employee = await db.get(
    "SELECT * FROM employees WHERE id = ?;",
    [params.employeeId]
  );
  return { employee };
}
export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const full_name = formData.get("full_name");
  const phone_number = formData.get("phone_number");
  const email = formData.get("email");
  const address = formData.get("address");
  const employee_imgSrc = formData.get("employee_imgSrc");
  const employee_cv = formData.get("employee_cv");
  const date_of_birth = formData.get("date_of_birth");
  const salary = formData.get("salary");
  const age = date_of_birth ? new Date().getFullYear() - new Date(date_of_birth.toString()).getFullYear() : null;
  if(!age || age<18){
    return { errors: ["Employee should be over 18"] };
  }
  if(!salary || Number(salary) < 100){
    return { errors: ["Salary should be greater than 100 dollars"] };
  }

  // console.log("employee_imgSrc", employee_imgSrc);
  // let photoPath = null;
  // if (employee_imgSrc && employee_imgSrc instanceof Blob) {
  //   console.log("employee_imgSrc", employee_imgSrc);
  //   const photoName = `${Date.now()}_${(employee_imgSrc as File).name}profile`;
  //   const photoDestination = path.join(process.cwd(), "public", "uploads", "photos", photoName);
  //   const photoBuffer = Buffer.from(await employee_imgSrc.arrayBuffer());
  //   await fs.writeFile(photoDestination, photoBuffer);
  //   photoPath = `/uploads/photos/${photoName}`;
  // }

  // // Handle CV upload
  // let cvPath = null;
  // if (employee_cv && employee_cv instanceof Blob) {
  //   const cvName = `${Date.now()}_${(employee_cv as File).name}cvs`;
  //   const cvDestination = path.join(process.cwd(), "public/uploads/cvs", cvName);
  //   const cvBuffer = Buffer.from(await employee_cv.arrayBuffer());
  //   await fs.writeFile(cvDestination, cvBuffer);
  //   cvPath = `/uploads/cvs/${cvName}`;
  // }
  const db = await getDB();
  await db.run(
    'UPDATE employees  SET full_name = ?, phone_number = ?, email = ?, address = ?, date_of_birth = ?, salary = ?   WHERE id = ?;',
    [full_name, phone_number, email, address, date_of_birth, salary, params.employeeId]
  );

  return redirect("/employees");
}


export default function EmployeePage() {
  const { employee } = useLoaderData();
  const actionData = useActionData();

  useEffect(() => {
    if (actionData?.errors) {
      alert(actionData.errors.join("\n"));
    }
  }, [actionData]);

  return (
    <div>
      <div>
      <h1>Update Employee</h1>
      <Form method="post" encType="multipart/form-data">
        <input type="hidden" name="id" value={employee.id} />
        <div>
          <label>Full Name</label>
          <input type="text" name="full_name" defaultValue={employee.full_name} required />
        </div>
        <div>
          <label>Phone Number</label>
          <input type="tel" name="phone_number" defaultValue={employee.phone_number} required />
        </div>
        <div>
          <label>Email</label>
          <input type="email" name="email" defaultValue={employee.email} required />
        </div>
        <div>
          <label>Address</label>
          <input type="text" name="address" defaultValue={employee.address} required />
        </div>
        <div>
          <label>Salary</label>
          <input type="number" name="salary" defaultValue={employee.salary} required />
        </div>
        <div>
          <label>Date of Birth</label>
          <input type="date" name="date_of_birth" defaultValue={employee.date_of_birth} required />
        </div>
        {/* <div>
          <label htmlFor="employee_imgSrc">Profile image</label>
          <input type="file" name="employee_imgSrc" accept="image/*"  />
        </div>
        <div>
          <label htmlFor="employee_cv">CV</label>
          <input type="file" name="employee_cv" accept=".pdf" />
        </div> */}
        <button type="submit">Update Employee</button>
      </Form>
    </div>
      <ul>
        <li><a href="/employees">Employees</a></li>
        <li><a href="/employees/new">New Employee</a></li>
        <li><a href="/timesheets/">Timesheets</a></li>
      </ul>
    </div>
  )
}
