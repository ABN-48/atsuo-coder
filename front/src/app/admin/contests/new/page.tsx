import { notFound } from "next/navigation";
import { hasContestMakerPermission } from "../../../../lib/accounts/permission";
import styles from "../form.module.css";
import Form from "@/components/form";
import Warning from "@/components/form/warnings";

export default async function Page() {

	if (!await hasContestMakerPermission()) {

		notFound();

	}

	return (
		<>
			<h1>New Contest | AtsuoCoder Admin</h1>
			<Form action="/admin/contests/post/new" method="post">
				<label htmlFor="name">Name</label>
				<br />
				<input name="name" id="name" type="text" autoComplete="on" placeholder="AtsuoCoder Algorithm Contest 001" required />
				<br />
				<label htmlFor="id">ID</label>
				<br />
				<input name="id" id="id" type="text" autoComplete="on" placeholder="aac001" required />
				<br />
				<Warning>
					警告：<a href="/reserved.json"><u>予約語</u></a>は含めないでください。
				</Warning>
				<br />
				<label htmlFor="start">Start</label>
				<br />
				<input name="start" id="start" type="datetime-local" required />
				<br />
				<label htmlFor="period">Period</label>
				<br />
				<input name="period" id="period" type="number" required className={styles.period} placeholder="100" />
				<label htmlFor="period">minutes</label>
				<br />
				<label htmlFor="penalty">Penalty</label>
				<br />
				<input name="penalty" id="penalty" type="number" required className={styles.period} placeholder="5" />
				<label htmlFor="penalty">minutes</label>
				<br />
				<label htmlFor="problems">Problems</label>
				<br />
				<input name="problems" id="problems" type="text" required placeholder="aac001_a, aac001_b, aac001_c ... , aac001_f" />
				<br />
				<label htmlFor="editors">Editors</label>
				<br />
				<input name="editors" id="editors" type="text" required placeholder="yama_can, abn48" />
				<br />
				<label htmlFor="testers">Tester</label>
				<br />
				<input name="testers" id="testers" type="text" required placeholder="yama_can, abn48" />
				<br />
				<label htmlFor="description">Description</label>
				<br />
				<textarea name="description" id="description" placeholder="This contest is ..." required />
				<br />
				<input type="submit" defaultValue="Create" />
			</Form>
		</>
	);

}