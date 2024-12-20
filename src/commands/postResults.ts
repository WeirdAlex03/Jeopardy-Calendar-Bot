/** @format */

import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { Database } from "../modules/database";
import emojiToImage from "../emojiToImage";
import { ownerId } from "../../config.json";
import { Question } from "../types/Question";

const data = new SlashCommandBuilder()
	.setName("post_results")
	.setDescription("[Admin only] Posts the results of the current clue");


async function execute(interaction: CommandInteraction) {
	if (interaction.user.id !== ownerId) {
		const embed = new EmbedBuilder()
			.setTitle("You are not authorized to use this command.")
			.setDescription("You must be a bot owner to use this command.")
			.setFooter({
				text: `Requested by ${interaction.user.tag}`,
				iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL,
			})
			.setTimestamp(new Date())
			.setColor("Red")
			.setThumbnail(emojiToImage("🚫"))
		;

		return await interaction.reply({ embeds: [embed.data], ephemeral: true });
	}

	const database = new Database();
	const today = new Date();
	const dayNum = await database.get("dayNum") as number;
	const currentClue = await database.get("currentClue") as Question;

	const responseKeys = (await database.list()).filter((key) => key.startsWith(`response/${dayNum}/`));
	const responses = await Promise.all(responseKeys.map((key) => database.get(key) as Promise<string>));

	const correctResponses = responses.filter((response) => currentClue.responses.includes(response));
	const incorrectResponses = responses.filter((response) => !currentClue.responses.includes(response));

	const scoresKeys = (await database.list()).filter((key) => key.startsWith("scores/weekly/"));
	const scores = await Promise.all(scoresKeys.map((key) => database.get(key) as Promise<number>));

	const embed = new EmbedBuilder()
		.setTitle(`Results for ${today.toLocaleDateString("en-US")}`)
		.setDescription(
			`> **${currentClue.category} - ${currentClue.value ?? "Final Jeopardy!"}**
			> ${currentClue.clue}
		
			*Original date: ${currentClue.originalDate}*
			
			The correct response: **${currentClue.responses[0]}**`)
		.addFields([
			{
				name: "Correct Responses",
				value: correctResponses.length > 0 ? correctResponses.join("\n") : "None!",
				inline: true
			},
			{
				name: "Incorrect Responses",
				value: incorrectResponses.length > 0 ? incorrectResponses.join("\n") : "None!",
				inline: true
			},
			{
				name: "Updated Scores",
				value: "TBD",
				inline: false
			}
		])
		.setFooter({
			text: `Requested by ${interaction.user.tag}`,
			iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL,
		})
		.setTimestamp(new Date())
		.setColor("Purple")
		.setThumbnail(emojiToImage("📝"))
	;

	await interaction.reply({ embeds: [embed.data], ephemeral: false });
}

export { data, execute };