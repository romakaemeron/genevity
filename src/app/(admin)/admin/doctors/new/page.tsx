import { requireSession } from "../../_actions/auth";
import DoctorForm from "../_components/doctor-form";

export default async function NewDoctorPage() {
  await requireSession();
  return <DoctorForm />;
}
