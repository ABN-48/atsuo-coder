import { sql } from "@/app/sql";
import styles from "./standings.module.css";
import { FieldPacket } from "mysql2";
import { notFound } from "next/navigation";
import getUser from "@/lib/user";
import getContest from "@/lib/contest";
import { ReactNode } from "react";

export default async function Page({ params: { contest: contestId } }: { params: { contest: string } }) {

	const user = await getUser();

	const contest = await getContest(contestId);
	if (!contest) notFound();

	if ((await contest.start!!.get()).getTime() > Date.now()) {

		if (user && !(await contest.editors!!.get()).includes(user.getID()!!) && !(await contest.testers!!.get()).includes(user.getID()!!)) notFound();
		if (!user) notFound();

	}

	const [submissions, _] = await sql.query("SELECT * FROM submissions WHERE contest = ? ORDER BY created_at", [contestId]) as [{ id: string, sourceCode: string, contest: string, task: string, user: string, created_at: Date, judge: string, language: string }[], FieldPacket[]];

	const scores: { [user: string]: { score: number, problems: { [problem: string]: { score: number, penalty: number, notEffectedPenalty: number, lastSubmitTime: number } } } } = {};

	for (let i = 0; i < submissions.length; i++) {

		if (submissions[i].judge == "WJ" || JSON.parse(submissions[i].judge).status == 3) continue;
		scores[submissions[i].user] = scores[submissions[i].user] || { score: 0, problems: {} };

		if (scores[submissions[i].user].problems[submissions[i].task] || -1 < JSON.parse(submissions[i].judge)[0][1]) {

			scores[submissions[i].user].problems[submissions[i].task].penalty += scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty || 0;
			scores[submissions[i].user].problems[submissions[i].task].lastSubmitTime = submissions[i].created_at.getTime() - (await contest.start!!.get()).getTime();
			scores[submissions[i].user].problems[submissions[i].task].score = JSON.parse(submissions[i].judge)[0][1];
			scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty = 1;

		} else {

			scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty = (scores[submissions[i].user].problems[submissions[i].task].notEffectedPenalty || 0) + 1;

		}

	}

	let users: { user: string, score: number, contestTime: number }[] = [];

	for (const user in scores) {

		let lastSubmitTime = 0;
		let penalty = 0;

		for (const problem in scores[user].problems) {

			scores[user].score += scores[user].problems[problem].score;
			penalty += scores[user].problems[problem].penalty;
			lastSubmitTime = Math.max(lastSubmitTime, scores[user].problems[problem].lastSubmitTime);

		}

		users.push({ user, score: scores[user].score, contestTime: lastSubmitTime + (await contest.penalty!!.get()) * penalty });

	}

	const rated_users = await contest.rated_users!!.get();
	const unrated_users = await contest.unrated_users!!.get();

	const registerd_users = rated_users.concat(unrated_users);

	users = users.filter((user) => registerd_users.includes(user.user));

	registerd_users.filter((user) => !users.find((value) => value.user == user)).map((user) => {

		users.push({ user, score: 0, contestTime: 0 });

	});

	users.sort((a, b) => (b.score - a.score == 0 ? a.contestTime - b.contestTime : b.score - a.score));

	return (
		<>
			<h1>Standings | AtsuoCoder</h1>
			<table>
				<thead>
					<tr>
						<td className={styles.user}>User</td>
						<td className={styles.user}>Total</td>
						{
							(await contest.problems!!.get()).map((problem, i) => {
								return (
									<td key={i}><a href={`/contests/${contestId}/tasks/${problem}`}>{problem}</a></td>
								)
							})
						}
					</tr>
				</thead>
				<tbody>
					{
						await (async () => {

							let nodes: ReactNode[] = [];
							let i = 0;

							for (const user of users) {

								nodes.push(
									<tr key={i}>
										<td className={styles.user}>{user.user}</td>
										<td className={styles.user}>{scores[user.user].score}</td>
										{
											(await contest.problems!!.get()).map((problem, j) => {
												return (
													<td key={j}>{scores[user.user].problems[problem].score || 0}</td>
												)
											})
										}
									</tr>
								);

								i++;

							}

							return nodes;

						})()
					}
				</tbody>
			</table>
		</>
	)

}