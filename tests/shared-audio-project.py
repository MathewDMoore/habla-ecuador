"""Verify target membership, embedding, and matching App Group configuration."""
import plistlib
from pathlib import Path
r=Path(__file__).resolve().parents[1]
p=plistlib.loads((r/'ios/HablaEcuador.xcodeproj/project.pbxproj').read_bytes())
o=p['objects']
targets={v['name']:v for v in o.values() if v['isa']=='PBXNativeTarget'}
app,share=targets['HablaEcuador'],targets['HablaEcuadorShare']
assert any(o[d]['target']==next(k for k,v in o.items() if v is share) for d in app['dependencies'])
assert any(o[o[f]['fileRef']]['path']=='HablaEcuadorShare.appex' for phase in app['buildPhases'] if o[phase]['isa']=='PBXCopyFilesBuildPhase' for f in o[phase]['files'])
for target in [app,share]:
    sources=[o[o[f]['fileRef']]['path'] for phase in target['buildPhases'] if o[phase]['isa']=='PBXSourcesBuildPhase' for f in o[phase]['files']]
    assert 'Shared/SharedAudioInbox.swift' in sources
    for c in o[target['buildConfigurationList']]['buildConfigurations']:
        settings=o[c]['buildSettings']
        ent=plistlib.loads((r/'ios'/settings['CODE_SIGN_ENTITLEMENTS']).read_bytes())
        assert ent['com.apple.security.application-groups']==['$(HABLA_APP_GROUP)']
        info=plistlib.loads((r/'ios'/settings['INFOPLIST_FILE']).read_bytes())
        assert info['HablaAppGroup']=='$(HABLA_APP_GROUP)'
        assert settings['CURRENT_PROJECT_VERSION']=='7'
        assert settings['MARKETING_VERSION']=='0.1.6'
        if target is share: assert settings['APPLICATION_EXTENSION_API_ONLY']=='YES'
print('Shared audio project graph and entitlements: passed')
