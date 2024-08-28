settings = read_json('../tilt.option.json')
settings_user = read_json('../tilt.option.user.json', {})

if settings_user != None:
  settings.update(settings_user)

def get_settings():
  return settings
