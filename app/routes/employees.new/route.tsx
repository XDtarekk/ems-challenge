import { Form, redirect, useActionData, type ActionFunction } from "react-router";
import { getDB } from "~/db/getDB";
import fs from "fs/promises";
import path from "path";
import { useEffect } from "react";

export const action: ActionFunction = async ({ request }) => {
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

  console.log("employee_imgSrc", employee_imgSrc);
  let photoPath = null;
  if (employee_imgSrc && employee_imgSrc instanceof Blob) {
    console.log("employee_imgSrc", employee_imgSrc);
    const photoName = `${Date.now()}_${(employee_imgSrc as File).name}profile`;
    const photoDestination = path.join(process.cwd(), "public", "uploads", "photos", photoName);
    const photoBuffer = Buffer.from(await employee_imgSrc.arrayBuffer());
    await fs.writeFile(photoDestination, photoBuffer);
    photoPath = `/uploads/photos/${photoName}`;
  }

  // Handle CV upload
  let cvPath = null;
  if (employee_cv && employee_cv instanceof Blob) {
    const cvName = `${Date.now()}_${(employee_cv as File).name}cvs`;
    const cvDestination = path.join(process.cwd(), "public/uploads/cvs", cvName);
    const cvBuffer = Buffer.from(await employee_cv.arrayBuffer());
    await fs.writeFile(cvDestination, cvBuffer);
    cvPath = `/uploads/cvs/${cvName}`;
  }
  const db = await getDB();
  await db.run(
    'INSERT INTO employees (full_name, phone_number, email, address, employee_imgSrc, employee_cv, date_of_birth,salary )  VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [full_name, phone_number, email, address, photoPath, cvPath, date_of_birth, salary]
  );

  return redirect("/employees");
}

// id INTEGER PRIMARY KEY AUTOINCREMENT,
//     full_name TEXT NULL,
//     phone_number TEXT NULL,
//     email TEXT NULL,
//     address TEXT NULL,
//     employee_imgSrc TEXT NULL,
//     employee_cv TEXT NULL,
//     date_of_birth DATE NULL,
//     salary INTEGER NULL
export default function NewEmployeePage() {
  const actionData = useActionData();
  useEffect(() => {
    if (actionData?.errors) {
      alert(actionData.errors.join("\n"));
    }
  }, [actionData]);
  return (
    <div>
      <h1>Create New Employee</h1>
      <Form method="post" encType="multipart/form-data">
        <div>
          <label htmlFor="full_name">Full Name</label>
          <input type="text" name="full_name" id="full_name" required />
        </div>
        <div>
          <label htmlFor="phone_number">Phone Number</label>
          <input type="tel" name="phone_number" id="phone_number" required />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" id="email"  required />
        </div>
        <div>
          <label htmlFor="address">Address</label>
          <input type="text" name="address" id="address" required />
        </div>
        <div>
          <label htmlFor="salary">Salary</label>
          <input type="number" name="salary" id="salary" required />
        </div>
        <div>
          <label htmlFor="date_of_birth">Date of birth</label>
          <input type="date" name="date_of_birth" id="date_of_birth" required/>
        </div>
        <div>
          <label htmlFor="employee_imgSrc">Profile image</label>
          <input type="file" name="employee_imgSrc" id="employee_imgSrc" accept="image/*"  />
        </div>
        <div>
          <label htmlFor="employee_cv">CV</label>
          <input type="file" name="employee_cv" id="employee_cv" accept=".pdf" />
        </div>
        <button type="submit">Create Employee</button>
      </Form>
      <hr />
      <ul>
        <li><a href="/employees">Employees</a></li>
        <li><a href="/timesheets">Timesheets</a></li>
      </ul>
    </div>
  );
}