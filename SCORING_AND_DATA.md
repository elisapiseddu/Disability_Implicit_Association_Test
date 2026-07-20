# Scoring and data dictionary

## Output files

The CSV contains one summary row followed by trial rows. The JSON file contains:

```text
metadata
summary
trials
```

## Key metadata fields

- `participant_id`
- `enumerator_id`
- `tablet_id`
- `session_uuid`
- `app_version`
- `started_at`
- `finished_at`
- `response_mode`
- `compatible_first`
- `good_side`
- `disabled_side_initial`
- `user_agent`
- `screen`

## Trial fields

- `block`: 1–7
- `phase`: practice or test
- `condition`: compatible, incompatible, or practice label
- `stimulus_id`
- `stimulus_kind`: image or word
- `stimulus_category`: disabled, abled, good, or bad
- `correct_key`
- `first_response`
- `first_response_rt`: latency to the first key/touch
- `response`: final correct response
- `rt`: total latency until the correct response
- `error`: whether the first response was wrong

## D-score direction

The score is constructed so that a **positive value** means faster performance when:

```text
Non-disabled Persons + Good
Disabled Persons + Bad
```

share response keys than when the pairings are reversed.

A positive value therefore reflects a relative automatic preference for abled over disnon-disabled persons under the conventional interpretation. Do not report an individual score as a diagnosis or stable personal trait.

## Algorithm implemented

The code follows the improved IAT scoring approach:

1. use blocks 3, 4, 6, and 7;
2. discard trials above 10,000 ms;
3. flag a participant when more than 10% of scored trials are below 300 ms;
4. replace an error trial latency with the mean correct latency for that block plus 600 ms;
5. calculate an inclusive standard deviation for the two practice combined blocks and another for the two test combined blocks;
6. standardize the incompatible-minus-compatible mean difference separately for practice and test blocks;
7. average the two standardized differences.

The summary includes:

- `d_score`
- `d_practice`
- `d_test`
- `fast_trial_proportion`
- `invalid_fast`
- `error_rate`
- `scored_trials`

## Analysis recommendation

Recalculate scores from raw trials in R, Stata, or Python rather than relying only on the embedded score. Preserve all raw files and document exclusions before examining treatment effects.
