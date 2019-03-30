import requests
import json
import datetime
import random

from social_core.backends.oauth import BaseOAuth2


class SwedbankOAuth2(BaseOAuth2):
    name = 'swedbank'
    ID_KEY = 'id'
    AUTHORIZATION_URL = 'https://psd2.api.swedbank.com/psd2/authorize'
    ACCESS_TOKEN_URL = 'https://psd2.api.swedbank.com/psd2/token'
    DEFAULT_SCOPE = ['PSD2sandbox']
    ACCESS_TOKEN_METHOD = 'POST'
    BIC_CODE = 'SANDEE2X'
    REDIRECT_STATE = False

    def auth_params(self, state=None):
        params = super().auth_params(state)
        params.update({
            'bic': self.BIC_CODE
        })

        return params

    def get_user_id(self, details, response):
        headers = {}
        data = json.dumps({
            'access': {
                'allPsd2': 'string',
                'availableAccounts': 'string',
                'balances': 'string',
                'transactions': 'string'
            },
            'frequencyPerDay': 'string',
            'recurringIndicator': 'string',
            'validUntil': 'string'
        })

        consent_url = 'https://psd2.api.swedbank.com/sandbox/v1/consents/?BIC=SANDEE2X'

        bearer_token = response.get('access_token', '')

        # user = User.objects.last()
        # sc_auth = user.social_auth.get(provider='swedbank')
        # bearer_token = sc_auth.extra_data['access_token']

        d = datetime.datetime.now().strftime('%a, %d %b %Y %H:%M:%S GMT')
        headers['Date'] = d
        headers['X-Request-ID'] = str(random.randint(10000, 99999))
        headers['Content-Type'] = 'application/json'
        headers['Authorization'] = f'Bearer {bearer_token}'

        consent_request = requests.post(consent_url, data=data, headers=headers)

        print(consent_request.text)
        consent_request.raise_for_status()

        # extra_data = sc_auth.extra_data
        consent_data = consent_request.json()
        consent_id = consent_data['consentId']

        # existing_auth = UserSocialAuth.objects.filter(uid=consent_id)

        # extra_data.update({'consent_data': consent_data})
        # sc_auth.extra_data = extra_data
        # sc_auth.uid = consent_id
        # sc_auth.save()

        return consent_id

    def get_redirect_uri(self, state=None):
        return 'https://wilt.ee/complete/swedbank/'



    # EXTRA_DATA = [(, )]

    # def auth_headers(self):
    #     auth_str = '{0}:{1}'.format(*self.get_key_and_secret())
    #     b64_auth_str = base64.urlsafe_b64encode(auth_str.encode()).decode()
    #     return {
    #         'Authorization': 'Basic {0}'.format(b64_auth_str)
    #     }
    #
    def get_user_details(self, response):
        # fullname, first_name, last_name = self.get_user_names(
        #     response.get('display_name')
        # )
        return {}
        # return {'username': response.get('id'),
        #         'email': response.get('email'),
        #         'fullname': fullname,
        #         'first_name': first_name,
        #         'last_name': last_name}
    #
    # def user_data(self, access_token, *args, **kwargs):
    #     """Loads user data from service"""
    #     return self.get_json(
    #         'https://api.spotify.com/v1/me',
    #         headers={'Authorization': 'Bearer {0}'.format(access_token)}
    #     )
