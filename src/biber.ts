import * as os from 'os'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import {BIBER_DL_BASE_PATH, BINARIES, DOWNLOAD} from './constants'

export const downloadBiber = async (biberVersion: string): Promise<string> => {
  const validVersion = biberVersion === 'latest' ? 'current' : biberVersion
  const platform = os.platform()
  const fileName = mapOsToFileName(platform)
  const url = buildDownloadURL(validVersion, fileName, platform)
  core.debug(`Downloading Biber from ${url}`)
  const archivePath = await tc.downloadTool(url)

  core.debug('Extracting Biber')
  let biberPath
  if (fileName.endsWith('.zip')) {
    biberPath = await tc.extractZip(archivePath)
  } else if (fileName.endsWith('.tar.gz')) {
    biberPath = await tc.extractTar(archivePath)
  }

  core.debug(`Biber path is ${biberPath}`)

  if (!archivePath || !biberPath) {
    throw new Error(`Unable to download biber from ${url}`)
  }

  return biberPath
}

export const buildDownloadURL = (
  version: string,
  fileName: string,
  platform: string
): string => {
  const osIdentifier = mapOsToIdentifier(platform)

  const link = [
    BIBER_DL_BASE_PATH,
    version,
    BINARIES,
    osIdentifier,
    fileName,
    DOWNLOAD
  ].join('/')

  return link
}

const mapOsToIdentifier = (platform: string): string => {
  const mappings: {[key: string]: string} = {
    win32: 'Windows',
    darwin: 'OSX_Intel',
    linux: 'Linux'
  }
  return mappings[platform] || platform
}

const mapOsToFileName = (platform: string): string => {
  const platformFileNames: Record<string, string> = {
    win32: 'biber-MSWIN64.zip',
    darwin: 'biber-darwin_x86_64.tar.gz',
    linux: 'biber-linux_x86_64.tar.gz'
  }
  return platformFileNames[platform]
}
