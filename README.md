# OVH DNS action

![CI](https://github.com/solinumasso/ovh-dns-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/solinumasso/ovh-dns-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/solinumasso/ovh-dns-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/solinumasso/ovh-dns-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/solinumasso/ovh-dns-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

This action provides the following functionality for GitHub Actions users:

- upsert a DNS record
- delete a DNS record

## Usage

See [action.yml](action.yml)

```yaml
- uses: solinumasso/ovh-dns-action
  with:
    # OVH credentials
    # Check the documentation here: https://help.ovhcloud.com/csm/en-gb-api-getting-started-ovhcloud-api?id=kb_article_view&sysparm_article=KB0042784
    application-key: ${{ secrets.OVH_APPLICATION_KEY }}
    application-secret: ${{ secrets.OVH_APPLICATION_SECRET }}
    consumer-key: ${{ secrets.OVH_CONSUMER_KEY }}
    # See options here: https://github.com/ovh/node-ovh/blob/master/lib/endpoints.js
    # endpoint: ovh-eu

    # Whether to upsert the record or making sure it's not there
    present: true

    zone: example.com
    subdomain: www
    # If preset is true, otherwise useless
    target: example.org.

    # Optional parameters

    # default: CNAME
    type: CNAME
    # Record type
    # default: 600
    ttl: 600
```

The only output is `record` which is the raw output from OVH API if
`present: true`.

## Caveats

This action is using node-ovh internally so it does not support proxy for
self-hosted runners as other GitHub Actions do.

## Contributions

Contributions are welcome! See [Contributor's Guide](contributors.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Aknowledge

This repository has been created from GitHub's template
[typescript-action](https://github.com/actions/typescript-action) under
[MIT license](https://github.com/actions/typescript-action/blob/main/LICENSE)
