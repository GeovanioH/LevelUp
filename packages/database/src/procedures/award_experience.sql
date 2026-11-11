-- ==============================================================================
-- LEVELUP SYSTEM : PROCÉDURE TRANSACTIONNELLE D'ATTRIBUTION D'EXPÉRIENCE
-- Verrouillage pessimiste FOR UPDATE, calcul de niveau, 7 rangs canoniques
-- ==============================================================================

CREATE OR REPLACE FUNCTION award_experience(
    p_player_id UUID,
    p_base_code "BaseStatCode",
    p_xp_amount INTEGER,
    p_quest_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_old_level INTEGER;
    v_new_level INTEGER;
    v_old_rank "RankCode";
    v_new_rank "RankCode";
    v_total_xp BIGINT;
    v_stat_xp INTEGER;
    v_stat_level INTEGER;
    v_stat_next_xp INTEGER;
    v_crystals_gained INTEGER;
    v_level_up BOOLEAN := FALSE;
BEGIN
    -- 1. Validation de sécurité : interdiction formelle d'XP négative ou nulle
    IF p_xp_amount <= 0 THEN
        RAISE EXCEPTION 'INVALID_XP_VALUE: Le montant d''XP doit être strictement positif.';
    END IF;

    -- 2. Récupération et verrouillage pessimiste du joueur (FOR UPDATE)
    SELECT current_level, total_xp, rank_code
    INTO v_old_level, v_total_xp, v_old_rank
    FROM players
    WHERE id = p_player_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'PLAYER_NOT_FOUND: Joueur introuvable.';
    END IF;

    -- 3. Mise à jour de l'XP totale et calcul des Cristaux d'Ombres (10 XP = 1 Cristal)
    v_total_xp := v_total_xp + p_xp_amount;
    v_crystals_gained := FLOOR(p_xp_amount / 10);

    -- 4. Calcul du nouveau niveau global : L = min(100, max(1, floor(1 + sqrt(total_xp / 100))))
    v_new_level := LEAST(100, GREATEST(1, FLOOR(1.0 + SQRT(v_total_xp::numeric / 100.0))::integer));

    IF v_new_level > v_old_level THEN
        v_level_up := TRUE;
    END IF;

    -- 5. Calcul du rang canonique (Échelle des 7 Rangs Réels)
    IF v_new_level >= 96 THEN
        v_new_rank := 'MONARCH';
    ELSIF v_new_level >= 86 THEN
        v_new_rank := 'S';
    ELSIF v_new_level >= 66 THEN
        v_new_rank := 'A';
    ELSIF v_new_level >= 46 THEN
        v_new_rank := 'B';
    ELSIF v_new_level >= 26 THEN
        v_new_rank := 'C';
    ELSIF v_new_level >= 11 THEN
        v_new_rank := 'D';
    ELSE
        v_new_rank := 'E';
    END IF;

    -- 6. Mise à jour du profil du joueur
    UPDATE players
    SET total_xp = v_total_xp,
        current_level = v_new_level,
        rank_code = v_new_rank,
        shadow_crystals = shadow_crystals + v_crystals_gained,
        updated_at = NOW()
    WHERE id = p_player_id;

    -- 7. Mise à jour de la statistique de base concernée avec recalcul du palier
    SELECT level, current_xp, next_level_xp
    INTO v_stat_level, v_stat_xp, v_stat_next_xp
    FROM player_stats
    WHERE player_id = p_player_id AND base_code = p_base_code
    FOR UPDATE;

    IF FOUND THEN
        v_stat_xp := v_stat_xp + p_xp_amount;
        WHILE v_stat_xp >= v_stat_next_xp AND v_stat_level < 100 LOOP
            v_stat_xp := v_stat_xp - v_stat_next_xp;
            v_stat_level := v_stat_level + 1;
            v_stat_next_xp := FLOOR(100.0 * POWER(v_stat_level::numeric, 1.75))::integer;
        END LOOP;

        UPDATE player_stats
        SET level = v_stat_level,
            current_xp = v_stat_xp,
            next_level_xp = v_stat_next_xp,
            total_points_invested = total_points_invested + p_xp_amount,
            updated_at = NOW()
        WHERE player_id = p_player_id AND base_code = p_base_code;
    END IF;

    -- 8. Piste d'audit immuable
    INSERT INTO audit_logs (id, player_id, event_type, event_payload, timestamp)
    VALUES (
        gen_random_uuid(),
        p_player_id,
        'AWARD_EXPERIENCE',
        jsonb_build_object(
            'xp_amount', p_xp_amount,
            'base_code', p_base_code,
            'quest_id', p_quest_id,
            'did_level_up', v_level_up,
            'new_level', v_new_level,
            'new_rank', v_new_rank,
            'crystals_gained', v_crystals_gained
        ),
        NOW()
    );

    -- 9. Retour JSONB structuré
    RETURN jsonb_build_object(
        'success', TRUE,
        'did_level_up', v_level_up,
        'new_level', v_new_level,
        'new_rank', v_new_rank,
        'total_xp', v_total_xp,
        'crystals_gained', v_crystals_gained
    );
END;
$$ LANGUAGE plpgsql;
