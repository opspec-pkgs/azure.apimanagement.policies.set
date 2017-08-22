[![Build Status](https://travis-ci.org/opspec-pkgs/azure.apimanagement.policies.set.svg?branch=master)](https://travis-ci.org/opspec-pkgs/azure.apimanagement.policies.set)

# Problem statement

sets azure api management policies.

policies are provided in the form of the following conventional dir structure:
```text
  |--
    |-- policy.xml # global policy
    |-- apis
      |-- {api-name} # repeat as needed
        |-- policy.xml
        |-- {operation-name} # repeat as needed
          |-- policy.xml
    |-- products
      |-- {product-name} # repeat as needed
        |-- policy.xml
```
see [example](example)

# Known Limitations

global level policy must be valid xml, all other policies can be passed as raw (unencoded) policy
# Example usage

> note: in examples, VERSION represents a version of the
> azure.apimanagement.policies.set pkg

## install

```shell
opctl pkg install github.com/opspec-pkgs/azure.apimanagement.policies.set#VERSION
```

## run

```
opctl run github.com/opspec-pkgs/azure.apimanagement.policies.set#VERSION
```

## compose

```yaml
op:
  pkg: { ref: github.com/opspec-pkgs/azure.apimanagement.policies.set#VERSION }
  inputs:
    subscriptionId:
    loginId:
    loginSecret:
    loginTenantId:
    resourceGroup:
    apiManagementServiceName:
    apiCredentialsKey:
    policies:
    # begin optional args
    apiCredentialsIdentifier:
    accessTokenMinutesValid:
    contentType:
    loginType:
    # end optional args
```

# Support

join us on
[![Slack](https://opspec-slackin.herokuapp.com/badge.svg)](https://opspec-slackin.herokuapp.com/)
or
[open an issue](https://github.com/opspec-pkgs/azure.apimanagement.policies.set/issues)

# Releases

releases are versioned according to
[![semver 2.0.0](https://img.shields.io/badge/semver-2.0.0-brightgreen.svg)](http://semver.org/spec/v2.0.0.html)
and [tagged](https://git-scm.com/book/en/v2/Git-Basics-Tagging); see
[CHANGELOG.md](CHANGELOG.md) for release notes

# Contributing

see
[project/CONTRIBUTING.md](https://github.com/opspec-pkgs/project/blob/master/CONTRIBUTING.md)
