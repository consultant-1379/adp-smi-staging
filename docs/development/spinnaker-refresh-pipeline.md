# Spinnaker refresh pipeline

The main purpose of this pipeline is to manage Spinnaker pipelines state.
This pipeline uploads updates for spinnaker pipelines if anything changed
in configs stored under `ci/spinnaker` folder.
These configs can be used to restore spinnaker pipelines to the stable state.
This is important to update these configs if any updates for spinnaker pipelines needed.
If config for spinnaker pipeline updated then `Drop` pipelien will trigger Spinnaker Refresh pipeline
and spinnaker pipeline will be updated with new changes from config.

  To update config(s) under `ci/spinnaker` folder you should do the following:

  1. Update config(s) under `ci/spinnaker` folder.
  2. To check if config(s) updated correctly Spinnaker Refresh pipeline can be
  run manually with commit refspec.
  3. Merge commit and check spinnaker pipelines state after `Drop` pipeline execution.

  To run this pipeline and restore spinnaker pipeline(s) you should do the following:

  1. Go to `adp-smi-staging-spinnaker-refresh` pipeline on Jenkins and click 'Build with Parameters'.
  2. You have to click and choose `RESTORE` field.
  3. If you want to restore all spinnaker pipelines then `all` value must be set in
  `RESTORE_PIPELINES` field or you can provide pipeline names which should be
  restored as a comma separated list.
  4. `GERRIT_REFSPEC` - gerrit patchset refspec.
  This is only used if there is a change in the ruleset or the Jenkins file.
  5. When all required fields are specified, the pipeline can be run.
  6. Check spinnaker pipelines state.
