import { db } from "../../config/db";

export class CampaignController {

    getAll = async (req: any, res: any) => {
        try {
            const [rows] = await db.query<any[]>("SELECT campaign_id, campaign_name FROM vicidial_campaigns");
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener campañas:", error);
            res.status(500).json({ error: "Error al obtener campañas" });
        }
    }
    getOne = async (req: any, res: any) => {
        try {
            const { campaign } = req.params;
            const [rows] = await db.query<any[]>("SELECT campaign_id, campaign_name FROM vicidial_campaigns WHERE campaign_id = ?", [campaign]);
            res.json(rows);
        } catch (error) {
            console.error("Error al obtener campaña:", error);
            res.status(500).json({ error: "Error al obtener campaña" });
        }
    }
    create = async (req: any, res: any) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();
    
            const {
                campaign_plantilla_id,
                campaign_name,
                campaign_id,
            } = req.body;
    
            // Fetch template campaign
            const [rows_plantilla] = await connection.query<any[]>(
                "SELECT * FROM vicidial_campaigns WHERE campaign_id = ?",
                [campaign_plantilla_id]
            );
    
            if (rows_plantilla.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: "Plantilla no encontrada" });
            }
    
            // Get template campaign data
            const templateCampaign = rows_plantilla[0];
    
            // Prepare new campaign data, copying all fields from template except campaign_id
            const newCampaignData = {
                campaign_id,
                campaign_name,
                active: templateCampaign.active,
                lead_order: templateCampaign.lead_order,
                allow_closers: templateCampaign.allow_closers,
                hopper_level: templateCampaign.hopper_level,
                auto_dial_level: templateCampaign.auto_dial_level,
                local_call_time: templateCampaign.local_call_time,
                dial_timeout: templateCampaign.dial_timeout,
                campaign_recording: templateCampaign.campaign_recording,
                campaign_rec_filename: templateCampaign.campaign_rec_filename,
                drop_call_seconds: templateCampaign.drop_call_seconds,
                use_internal_dnc: templateCampaign.use_internal_dnc,
                omit_phone_code: templateCampaign.omit_phone_code,
                dial_method: templateCampaign.dial_method,
                adaptive_dropped_percentage: templateCampaign.adaptive_dropped_percentage,
                agent_pause_codes_active: templateCampaign.agent_pause_codes_active,
                dial_statuses: templateCampaign.dial_statuses,
                no_hopper_leads_logins: templateCampaign.no_hopper_leads_logins,
                survey_first_audio_file: templateCampaign.survey_first_audio_file,
                survey_opt_in_audio_file: templateCampaign.survey_opt_in_audio_file,
                survey_ni_audio_file: templateCampaign.survey_ni_audio_file,
                manual_dial_filter: templateCampaign.manual_dial_filter,
                survey_third_audio_file: templateCampaign.survey_third_audio_file,
                survey_fourth_audio_file: templateCampaign.survey_fourth_audio_file,
                agent_display_dialable_leads: templateCampaign.agent_display_dialable_leads,
                waitforsilence_options: templateCampaign.waitforsilence_options,
                available_only_tally_threshold: templateCampaign.available_only_tally_threshold,
                dial_level_threshold: templateCampaign.dial_level_threshold,
                screen_labels: templateCampaign.screen_labels,
                dial_prefix: templateCampaign.dial_prefix,
                three_way_dial_prefix: templateCampaign.three_way_dial_prefix,
                manual_dial_prefix: templateCampaign.manual_dial_prefix
                
            };
    
            // Insert new campaign
            const [campaignResult] = await connection.query<any>(
                `INSERT INTO vicidial_campaigns (
                    campaign_id, campaign_name, active, 
                    lead_order, allow_closers, hopper_level, 
                    auto_dial_level, local_call_time, dial_timeout, 
                    campaign_recording, campaign_rec_filename, drop_call_seconds, 
                    use_internal_dnc, omit_phone_code, dial_method, 
                    adaptive_dropped_percentage, agent_pause_codes_active, dial_statuses, 
                    no_hopper_leads_logins, survey_first_audio_file, survey_opt_in_audio_file, 
                    survey_ni_audio_file, manual_dial_filter, survey_third_audio_file, 
                    survey_fourth_audio_file, agent_display_dialable_leads, waitforsilence_options, 
                    available_only_tally_threshold, dial_level_threshold, screen_labels,
                    dial_prefix, three_way_dial_prefix, manual_dial_prefix
                ) VALUES (
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?,
                    ?, ?, ?
                )`,
                [
                    newCampaignData.campaign_id, newCampaignData.campaign_name,
                    newCampaignData.active, newCampaignData.lead_order, newCampaignData.allow_closers,
                    newCampaignData.hopper_level, newCampaignData.auto_dial_level, newCampaignData.local_call_time,
                    newCampaignData.dial_timeout, newCampaignData.campaign_recording, newCampaignData.campaign_rec_filename,
                    newCampaignData.drop_call_seconds, newCampaignData.use_internal_dnc, newCampaignData.omit_phone_code,
                    newCampaignData.dial_method, newCampaignData.adaptive_dropped_percentage, newCampaignData.agent_pause_codes_active,
                    newCampaignData.dial_statuses, newCampaignData.no_hopper_leads_logins, newCampaignData.survey_first_audio_file,
                    newCampaignData.survey_opt_in_audio_file, newCampaignData.survey_ni_audio_file, newCampaignData.manual_dial_filter,
                    newCampaignData.survey_third_audio_file, newCampaignData.survey_fourth_audio_file, newCampaignData.agent_display_dialable_leads,
                    newCampaignData.waitforsilence_options, newCampaignData.available_only_tally_threshold, newCampaignData.dial_level_threshold,
                    newCampaignData.screen_labels, newCampaignData.dial_prefix, newCampaignData.three_way_dial_prefix, newCampaignData.manual_dial_prefix
                ]
            );
    
            const newCampaignId = campaignResult.insertId;
    
            // Fetch template campaign statuses
            const [statusRows] = await connection.query<any[]>(
                "SELECT * FROM vicidial_campaign_statuses WHERE campaign_id = ?",
                [campaign_plantilla_id]
            );
    
            // Copy campaign statuses
            for (const status of statusRows) {
                await connection.query(
                    `INSERT INTO vicidial_campaign_statuses (
                        status, status_name, selectable, campaign_id, human_answered, category,
                        sale, dnc, customer_contact, not_interested, unworkable, scheduled_callback, 
                        completed, min_sec, max_sec, answering_machine
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        status.status,
                        status.status_name,
                        status.selectable,
                        campaign_id,
                        status.human_answered,
                        status.category,
                        status.sale,
                        status.dnc,
                        status.customer_contact,
                        status.not_interested,
                        status.unworkable,
                        status.scheduled_callback,
                        status.completed,
                        status.min_sec,
                        status.max_sec,
                        status.answering_machine
                    ]
                );
            }
            const [pause_codes] = await connection.query<any[]>(`select * from vicidial_pause_codes where campaign_id = ?;`, [campaign_plantilla_id]);
            for (const pause_code of pause_codes) {
                await connection.query(
                    `INSERT INTO vicidial_pause_codes (pause_code, pause_code_name, billable, campaign_id, time_limit, require_mgr_approval) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        pause_code.pause_code,
                        pause_code.pause_code_name,
                        pause_code.billable,
                        campaign_id,
                        pause_code.time_limit,
                        pause_code.require_mgr_approval
                    ]
                );
            }
            await connection.commit();
            res.json({
                message: "Campaign created successfully",
                campaign_id,
                campaign_name
            });
    
        } catch (error) {
            await connection.rollback();
            console.error("Error al crear campaña:", error);
            res.status(500).json({ error: "Error al crear campaña" });
        } finally {
            connection.release();
        }
    }
}