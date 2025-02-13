import { useEffect, useRef } from "react";
import { useLoaderData, useNavigate } from "react-router"
import { getDB } from "~/db/getDB"

// export async function loader() {
//   const db = await getDB()
//   const employees = await db.all("SELECT * FROM employees;")

//   return { employees }
// }
export async function loader({ request }: { request: Request }) {
  const db = await getDB();
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const sortByTitle = url.searchParams.get("sort") === "true";
  const page = parseInt(url.searchParams.get("page") || "1");
  const filterByAge = url.searchParams.get("filterByAge") === "true";
  const pageSize = 5;
  const offset = (page - 1) * pageSize;
  const orderClause = sortByTitle ? "ORDER BY full_name ASC" : "";
  const ageClause = filterByAge ? "AND (strftime('%Y', 'now') - strftime('%Y', date_of_birth)) > 20" : "";
  const employees = await db.all(
    `SELECT * FROM employees WHERE full_name LIKE ? ${ageClause} ${orderClause}  LIMIT ? OFFSET ?;`,
    [`%${search}%`, pageSize, offset]
  );

  const total = await db.get(
    "SELECT COUNT(*) as count FROM employees WHERE full_name LIKE ?;",
    [`%${search}%`]
  );

  return { employees, total: total.count, page, pageSize, search , sortByTitle, filterByAge};
}

export default function EmployeesPage() {
  const { employees , search, total, page, pageSize, sortByTitle, filterByAge} = useLoaderData()
  const navigate = useNavigate()
  // const observerRef = useRef(null)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    navigate(`?search=${searchValue}&sort=${sortByTitle}&page=1&filterByAge=${filterByAge}`);
  };
  const handleSort = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.checked;
    console.log("searchValue", searchValue);
    navigate(`?search=${search}&sort=${searchValue}&page=1&filterByAge=${filterByAge}`);
  };
  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filterValue = e.target.value;
    navigate(`?search=${search}&filterByAge=${filterValue}&page=1&sort=${sortByTitle}`);
  };
  const handlePageChange = (newPage: number) => {
    navigate(`?search=${search}&sort=${sortByTitle}&page=${newPage}&filterByAge=${filterByAge}`);
  };


  return (
    <div>
      <input defaultValue={search} onChange={handleSearch} type="text" placeholder="Search Employees" style={{width:"100%"}}/>
      <div>
        <label className="switch">
          <input type="checkbox" defaultValue={sortByTitle} onChange={handleSort}/>
          <span className="slider"></span>
        </label>
        sort by name
      </div>
      <select value={filterByAge} onChange={handleFilter}>
        <option value="false">All Employees</option>
        <option value="true">Older than 20</option>
      </select>
      <div className="employee-profiles-wrapper">
        {employees.map((employee: any) => (
          <div className="employee-profile" key={employee?.id}>
            {employee?.employee_imgSrc && (
              <img src={employee.employee_imgSrc} alt="Employee Image" className="employee-profile-listing"/>
            )}
              <p>Employee #{employee?.id}</p>
              <p>Full Name: {employee?.full_name}</p>
              <p>Email : {employee?.email}</p>
              <a href={`/employees/${employee?.id}`}>View Profile</a>
          </div>
        ))}
        <div style={{ height: "20px" }}>
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page * pageSize >= total}
          >
            Next
          </button>
        </div>
      </div>
      <hr />
      <ul>
        <li><a href="/employees/new">New Employee</a></li>
        <li><a href="/timesheets/">Timesheets</a></li>
      </ul>
    </div>
  )
}
