import { requireSession } from "../../_actions/auth";
import EquipmentForm from "../_components/equipment-form";

export default async function NewEquipmentPage() {
  await requireSession();
  return <EquipmentForm />;
}
